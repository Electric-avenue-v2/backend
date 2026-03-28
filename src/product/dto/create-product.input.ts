import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	ArrayMinSize,
	IsArray,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Min,
	ValidateNested
} from 'class-validator';

@InputType()
export class ProductAttributeInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	attributeValueId: string;
}

@InputType()
export class ProductImageInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	url: string;

	@Field()
	@IsString()
	@IsNotEmpty()
	publicId: string;
}

@InputType()
export class CreateVariantInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	sku: string;

	@Field(() => Float)
	@IsNumber()
	@Min(0)
	price: number;

	@Field(() => Int)
	@IsNumber()
	@Min(0)
	stock: number;

	@Field(() => [ProductAttributeInput])
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ProductAttributeInput)
	attributes: ProductAttributeInput[];

	@Field(() => [ProductImageInput])
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ProductImageInput)
	images: ProductImageInput[];
}

@InputType()
export class CreateProductInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	title: string;

	@Field()
	@IsString()
	@IsNotEmpty()
	description: string;

	@Field()
	@IsString()
	@IsNotEmpty()
	categoryId: string;

	@Field(() => [ProductImageInput], { nullable: true })
	@IsOptional()
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ProductImageInput)
	images?: ProductImageInput[];

	@Field(() => [ProductAttributeInput])
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => ProductAttributeInput)
	specs: ProductAttributeInput[];

	@Field(() => [CreateVariantInput])
	@IsArray()
	@ValidateNested({ each: true })
	@ArrayMinSize(1, {
		message: 'The product must have at least one variant (SKU)'
	})
	@Type(() => CreateVariantInput)
	variants: CreateVariantInput[];
}
