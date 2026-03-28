import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

@InputType()
export class ProductAttributeFilter {
	@Field()
	slug: string; // "color", "storage"

	@Field(() => [String])
	values: string[]; // ["red", "blue"]
}

@InputType()
export class GetProductsInput {
	@Field(() => String, { nullable: true })
	@IsOptional()
	@IsString()
	search?: string;

	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	categoryId?: string;

	@Field(() => Float, { nullable: true })
	@IsOptional()
	@IsNumber()
	@Min(0)
	minPrice?: number;

	@Field(() => Float, { nullable: true })
	@IsOptional()
	@IsNumber()
	@Min(0)
	maxPrice?: number;

	@Field(() => [ProductAttributeFilter], { nullable: true })
	@IsOptional()
	@IsArray()
	attributes?: ProductAttributeFilter[];

	@Field(() => Int, { defaultValue: 0 })
	@Min(0)
	offset = 0;

	@Field(() => Int, { defaultValue: 20 })
	@Min(1)
	limit = 20;
}
