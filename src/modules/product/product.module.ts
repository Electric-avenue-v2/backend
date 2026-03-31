import { Module } from '@nestjs/common';
import { SearchModule } from '~/search/search.module';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';

@Module({
	imports: [SearchModule],
	providers: [ProductService, ProductResolver],
	exports: [ProductService]
})
export class ProductModule {}
