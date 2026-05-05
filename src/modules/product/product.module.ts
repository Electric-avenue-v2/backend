import { Module } from '@nestjs/common';
import { ElasticSearchModule } from '~/infrastructure/elastic-search';
import { ProductIndexService } from './product-index.service';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { RedisStreamConsumerService } from './redis-stream-consumer.service';
import { ProductMapper } from './mappers/product.mapper';

@Module({
	imports: [ElasticSearchModule],
	providers: [
		ProductService,
		ProductIndexService,
		RedisStreamConsumerService,
		ProductResolver,
		ProductMapper
	],
	exports: [ProductIndexService]
})
export class ProductModule {}
