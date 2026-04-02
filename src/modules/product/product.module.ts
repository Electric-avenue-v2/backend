import { Module } from '@nestjs/common';
import { ElasticSearchModule } from '~/infrastructure/elastic-search/elastic-search.module';
import { ProductIndexService } from './product-index.service';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { RedisStreamConsumerService } from './redis-stream-consumer.service';

@Module({
	imports: [ElasticSearchModule],
	providers: [ProductService, ProductIndexService, RedisStreamConsumerService, ProductResolver],
	exports: [ProductIndexService]
})
export class ProductModule {}
