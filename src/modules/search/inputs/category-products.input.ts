import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';
import { SearchProductsInput } from './search-products.input';

@InputType()
export class CategoryProductsInput extends SearchProductsInput {
	@Field()
	@IsString()
	categorySlug: string;
}
