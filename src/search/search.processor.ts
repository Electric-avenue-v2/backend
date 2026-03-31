import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { SuccessResponse } from '~/common/models';
import { PrismaService } from '~/infrastructure/prisma/prisma.service';
import { SearchService } from './search.service';

@Processor('search-queue')
export class SearchProcessor extends WorkerHost {
	private readonly logger = new Logger(SearchProcessor.name);

	constructor(
		private readonly searchService: SearchService,
		private readonly prisma: PrismaService
	) {
		super();
	}

	async process(job: Job<{ productId: string }>): Promise<SuccessResponse | void> {
		const { productId } = job.data;

		switch (job.name) {
			case 'index-product': {
				return this.handleIndexProduct(productId);
			}
			case 'delete-product': {
				return this.handleDeleteProduct(productId);
			}
			default: {
				this.logger.warn(`Unknown job name: ${job.name}`);
				return;
			}
		}
	}

	private async handleIndexProduct(productId: string): Promise<SuccessResponse> {
		this.logger.log(`Start of product indexing: ${productId}`);

		const product = await this.prisma.product.findUnique({
			where: { id: productId },
			include: {
				category: true,
				productImages: true,
				specs: { include: { value: { include: { attribute: true } } } },
				variants: {
					include: {
						attributes: {
							include: { value: { include: { attribute: true } } }
						},
						productImages: true
					}
				}
			}
		});

		if (!product) {
			this.logger.warn(`Product ${productId} not found`);
			return { success: false };
		}

		await this.searchService.indexProduct(product);

		this.logger.log(`Product ${productId} has been successfully indexed.`);
		return { success: true };
	}

	private async handleDeleteProduct(productId: string): Promise<SuccessResponse> {
		this.logger.log(`Removing product from index: ${productId}`);

		const res = await this.searchService.removeProduct(productId);

		this.logger.log(`Product ${productId} removed from index.`);
		return { success: res };
	}
}
