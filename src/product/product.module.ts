import { Module } from '@nestjs/common';
import { ProductResolver } from '~/product/product.resolver';
import { SearchModule } from '~/search/search.module';
import { ProductService } from './product.service';

@Module({
	imports: [SearchModule],
	providers: [ProductService, ProductResolver],
	exports: [ProductService]
})
export class ProductModule {}
