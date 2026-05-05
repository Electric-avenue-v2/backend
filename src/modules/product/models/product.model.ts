import { Field, Float, ID, Int, InterfaceType, ObjectType } from '@nestjs/graphql';




@ObjectType()
export class ProductCategory {
	@Field(() => ID)
	id: string;

	@Field()
	name: string;

	@Field()
	slug: string;

	@Field(() => String, { nullable: true })
	icon?: string;
}

@ObjectType()
export class ProductSeller {
	@Field(() => ID)
	id: string;

	@Field()
	firstName: string;

	@Field()
	lastName: string;
}

@ObjectType()
export class ProductAttribute {
	@Field()
	name: string;

	@Field()
	slug: string;

	@Field()
	value: string;
}

@ObjectType()
export class ProductImage {
	@Field(() => ID)
	id: string;

	@Field()
	url: string;

	@Field()
	publicId: string;
}

@ObjectType()
export class ProductVariant {
	@Field(() => ID)
	id: string;

	@Field()
	sku: string;

	@Field(() => Float)
	price: number;

	@Field(() => Int)
	stock: number;

	@Field(() => [ProductImage], { nullable: true })
	productImages: ProductImage[];

	@Field(() => [ProductAttribute], { nullable: true })
	attributes?: ProductAttribute[];
}

@InterfaceType()
export class ProductBase {
	@Field(() => ID)
	id: string;

	@Field()
	title: string;

	@Field()
	slug: string;

	@Field()
	createdAt: Date;

	@Field()
	updatedAt: Date;

	@Field(() => ProductCategory)
	category: ProductCategory;

	@Field(() => Float, { description: 'Min price of variants' })
	minPrice?: number;

	@Field(() => Float, { description: 'Max price of variants' })
	maxPrice: number;

	@Field(() => String, { description: 'Main picture' })
	thumbnailUrl: string;
}

@ObjectType({ implements: () => [ProductBase] })
export class ProductDetails extends ProductBase {
	@Field()
	description: string;

	@Field(() => ProductSeller)
	seller: ProductSeller;

	@Field(() => [ProductAttribute], { nullable: true })
	specs?: ProductAttribute[];

	@Field(() => [ProductVariant])
	variants: ProductVariant[];

	@Field(() => [ProductImage])
	productImages: ProductImage[];
}

@ObjectType()
export class ProductSeo {
	@Field(() => ID)
	id: string;

	@Field()
	title: string;

	@Field()
	description: string;

	@Field(() => String)
	thumbnailUrl?: string;
}