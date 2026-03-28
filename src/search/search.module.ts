import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@opensearch-project/opensearch';
import { OPENSEARCH_CLIENT } from '~/search/search.config';
import { SearchProcessor } from './search.processor';
import { SearchService } from './search.service';

@Module({
	imports: [
		BullModule.registerQueue({
			name: 'search-queue'
		})
	],
	providers: [
		{
			provide: OPENSEARCH_CLIENT,
			useFactory: (configService: ConfigService): Client => {
				return new Client({
					node: configService.getOrThrow('ELASTIC_NODE')
				});
			},
			inject: [ConfigService]
		},
		SearchService,
		SearchProcessor
	],
	exports: [OPENSEARCH_CLIENT, SearchService, BullModule]
})
export class SearchModule {}
