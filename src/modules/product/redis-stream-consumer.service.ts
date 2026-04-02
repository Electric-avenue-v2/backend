import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { isObject } from '~/common/utils/utils';
import { PrismaService } from '~/infrastructure/prisma/prisma.service';
import { PRODUCT_FULL_INCLUDE } from './constants/product.constants';
import { ALL_STREAM_KEYS, STREAM_RESOLVERS } from './constants/redis-consumer.constants';
import { ProductIndexService } from './product-index.service';
import { StreamResult } from './types/redis-consumer.types';
import { ProductMapper } from './utils/product.mapper';
import { isDebeziumPayload, isStreamResults } from './utils/redis-consumer.utils';

@Injectable()
export class RedisStreamConsumerService implements OnModuleInit, OnModuleDestroy {
	private readonly logger = new Logger(RedisStreamConsumerService.name);
	private readonly client: Redis;
	private isRunning = false;

	private readonly consumerGroup = 'elastic-sync-group';
	private readonly consumerName = 'nestjs-worker-1';

	constructor(
		private readonly configService: ConfigService,
		private readonly productSearchService: ProductIndexService,
		private readonly prisma: PrismaService
	) {
		this.client = new Redis({
			host: this.configService.getOrThrow<string>('REDIS_HOST'),
			port: Number(this.configService.getOrThrow<string>('REDIS_PORT')),
			password: this.configService.getOrThrow<string>('REDIS_PASSWORD')
		});
	}

	async onModuleInit(): Promise<void> {
		await this.ensureConsumerGroups();
		this.isRunning = true;
		void this.consume();
	}

	async onModuleDestroy(): Promise<void> {
		this.isRunning = false;
		await this.client.quit();
	}

	private async ensureConsumerGroups(): Promise<void> {
		for (const streamKey of ALL_STREAM_KEYS) {
			try {
				await this.client.xgroup('CREATE', streamKey, this.consumerGroup, '0', 'MKSTREAM');
				this.logger.log(`Consumer group created for stream: ${streamKey}`);
			} catch (err: unknown) {
				if (err instanceof Error && !err.message.includes('BUSYGROUP')) {
					throw err;
				}
			}
		}
	}

	private async consume(): Promise<void> {
		await this.processPending();

		while (this.isRunning) {
			try {
				const results = await this.client.xreadgroup(
					'GROUP',
					this.consumerGroup,
					this.consumerName,
					'COUNT',
					10,
					'BLOCK',
					5000,
					'STREAMS',
					...ALL_STREAM_KEYS,
					...ALL_STREAM_KEYS.map(() => '>')
				);

				if (isStreamResults(results)) {
					await this.processStreamResults(results);
				}
			} catch (err: unknown) {
				this.logger.error('Stream read error', err);
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
		}
	}

	private async processPending(): Promise<void> {
		try {
			const results = await this.client.xreadgroup(
				'GROUP',
				this.consumerGroup,
				this.consumerName,
				'COUNT',
				'100',
				'STREAMS',
				...ALL_STREAM_KEYS,
				...ALL_STREAM_KEYS.map(() => '0')
			);

			if (isStreamResults(results)) {
				await this.processStreamResults(results);
			}
		} catch (err: unknown) {
			this.logger.error('Failed to process pending messages', err);
		}
	}

	private async processStreamResults(results: StreamResult[]): Promise<void> {
		for (const [streamKey, messages] of results) {
			for (const [messageId, fields] of messages) {
				await this.handleMessage(streamKey, messageId, fields);
			}
		}
	}

	private async handleMessage(streamKey: string, messageId: string, fields: string[]): Promise<void> {
		try {
			if (fields.length < 2) {
				await this.ack(streamKey, messageId);
				return;
			}

			let parsed: unknown;
			try {
				parsed = JSON.parse(fields[1]);
			} catch {
				this.logger.warn(`Invalid JSON (Poison Pill) in ${streamKey}: ${fields[1]}`);
				await this.ack(streamKey, messageId);
				return;
			}

			if (!isDebeziumPayload(parsed)) {
				this.logger.warn(`Non-Debezium payload in ${streamKey}, skipped`);
				await this.ack(streamKey, messageId);
				return;
			}

			const { op, before, after } = parsed;
			const record = op === 'd' ? before : after;

			if (!isObject(record)) {
				await this.ack(streamKey, messageId);
				return;
			}

			const resolver = STREAM_RESOLVERS[streamKey];
			if (resolver === undefined) {
				this.logger.warn(`No resolver for stream: ${streamKey}`);
				await this.ack(streamKey, messageId);
				return;
			}

			const productId = await resolver(record, this.prisma);

			if (productId === null) {
				this.logger.warn(`Could not resolve productId from ${streamKey} (op: ${op})`);
				await this.ack(streamKey, messageId);
				return;
			}

			if (op === 'd' && streamKey === 'db.public.products') {
				await this.productSearchService.deleteProduct(productId);
				this.logger.log(`Deleted product ${productId}`);
			} else if (op === 'c' || op === 'u' || op === 'r') {
				await this.reindexProduct(productId, op);
			}

			await this.ack(streamKey, messageId);
		} catch (err: unknown) {
			this.logger.error(`Failed to process message ${messageId} from ${streamKey}, will retry`, err);
		}
	}

	private async reindexProduct(productId: string, op: string): Promise<void> {
		const product = await this.prisma.product.findUnique({
			where: { id: productId },
			include: PRODUCT_FULL_INCLUDE
		});

		if (product === null) {
			this.logger.warn(`Product ${productId} not found, skipping reindex`);
			return;
		}

		const doc = ProductMapper.toEsDocument(product);
		await this.productSearchService.indexProduct(doc);
		this.logger.log(`Reindexed product ${productId} (op: ${op})`);
	}

	private async ack(streamKey: string, messageId: string): Promise<void> {
		await this.client.xack(streamKey, this.consumerGroup, messageId);
	}
}
