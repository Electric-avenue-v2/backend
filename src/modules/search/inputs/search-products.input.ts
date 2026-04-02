import { Field, Float, InputType, Int, registerEnumType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	IsArray,
	IsBoolean,
	IsEnum,
	IsNumber,
	IsOptional,
	IsString,
	Max,
	Min,
	MinLength,
	ValidateNested
} from 'class-validator';

export enum ProductSort {
	NEWEST = 'NEWEST',
	PRICE_ASC = 'PRICE_ASC',
	PRICE_DESC = 'PRICE_DESC',
	POPULAR = 'POPULAR'
}

registerEnumType(ProductSort, { name: 'ProductSort' });

@InputType()
export class AttributeFilterInput {
	@Field()
	@IsString()
	slug: string;

	@Field(() => [String])
	@IsArray()
	@IsString({ each: true })
	values: string[];
}

@InputType()
export class SearchProductsInput {
	@Field({ nullable: true })
	@IsOptional()
	@IsString()
	@MinLength(2)
	query?: string;

	@Max(200)
	@Field(() => Int, { defaultValue: 1 })
	@IsNumber()
	@Min(1)
	page = 1;

	@Max(48)
	@Field(() => Int, { defaultValue: 24 })
	@IsNumber()
	@Min(1)
	limit = 24;

	@Field(() => ProductSort, { defaultValue: ProductSort.NEWEST })
	@IsEnum(ProductSort)
	sort: ProductSort = ProductSort.NEWEST;

	@Field(() => Float, { nullable: true })
	@IsOptional()
	@IsNumber()
	minPrice?: number;

	@Field(() => Float, { nullable: true })
	@IsOptional()
	@IsNumber()
	maxPrice?: number;

	@Field({ nullable: true })
	@IsOptional()
	@IsBoolean()
	inStock?: boolean;

	@Field(() => [AttributeFilterInput], { nullable: true })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => AttributeFilterInput)
	attributes?: AttributeFilterInput[];
}
