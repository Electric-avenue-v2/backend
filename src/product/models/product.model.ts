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
export class AttributeInfo {
	@Field(() => ID)
	id: string;

	@Field()
	name: string;

	@Field()
	slug: string;
}

@ObjectType()
export class AttributeValue {
	@Field(() => ID)
	id: string;

	@Field()
	value: string;

	@Field(() => AttributeInfo)
	attribute: AttributeInfo;
}

@ObjectType()
export class ProductAttributeValue {
	@Field(() => AttributeValue)
	value: AttributeValue;
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

	@Field(() => [ProductAttributeValue], { nullable: true })
	attributes?: ProductAttributeValue[];
}

@InterfaceType({
	resolveType(value: ProductDetails | ProductListItem) {
		if ('description' in value) {
			return ProductDetails;
		}
		return ProductListItem;
	}
})
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

	@Field(() => Float, { nullable: true, description: 'Min price of variants' })
	minPrice?: number;

	@Field(() => String, { nullable: true, description: 'Main picture' })
	thumbnail?: string;
}

@ObjectType({ implements: () => [ProductBase] })
export class ProductListItem extends ProductBase {
	@Field(() => Int, { description: 'Quantity of goods' })
	variantsCount: number;
}

@ObjectType({ implements: () => [ProductBase] })
export class ProductDetails extends ProductBase {
	@Field()
	description: string;

	@Field(() => ProductSeller)
	seller: ProductSeller;

	@Field(() => [ProductAttributeValue])
	specs: ProductAttributeValue[];

	@Field(() => [ProductVariant])
	variants: ProductVariant[];

	@Field(() => [ProductImage])
	productImages: ProductImage[];
}

@ObjectType()
export class ProductPagination {
	@Field(() => [ProductListItem])
	items: ProductListItem[];

	@Field(() => Int)
	total: number;
}
