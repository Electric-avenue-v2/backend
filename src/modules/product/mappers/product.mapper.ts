import { Prisma } from '@prisma/client';
import { toNumericValue } from '~/common/utils';
import { ProductDetails } from '~/modules/product/models/product.model';
import { PRODUCT_FULL_INCLUDE } from '../constants/product.constants';
import type { CreateProductInput } from '../inputs/create-product.input';
import type { EsAttribute, EsProductDocument, EsProductVariant } from '../types/es-product.types';

type ProductFullPayload = Prisma.ProductGetPayload<{ include: typeof PRODUCT_FULL_INCLUDE }>;
type AttributeValuePayload = ProductFullPayload['specs'][number]['value'];

export class ProductMapper {
	toPrismaCreate(
		sellerId: string,
		slug: string,
		input: CreateProductInput
	): Prisma.ProductCreateInput {
		return {
			title: input.title,
			description: input.description,
			slug,
			seller: { connect: { id: sellerId } },
			category: { connect: { id: input.categoryId } },
			...(input.images &&
				input.images.length > 0 && {
					productImages: {
						create: input.images.map(img => ({
							url: img.url,
							publicId: img.publicId
						}))
					}
				}),
			specs: {
				create: input.specs.map(spec => ({
					value: { connect: { id: spec.attributeValueId } }
				}))
			},
			variants: {
				create: input.variants.map(variant => ({
					sku: variant.sku,
					price: variant.price,
					stock: variant.stock,
					productImages: {
						create: variant.images.map(img => ({
							url: img.url,
							publicId: img.publicId
						}))
					},
					attributes: {
						create: variant.attributes.map(attr => ({
							value: { connect: { id: attr.attributeValueId } }
						}))
					}
				}))
			}
		};
	}

	toEsDocument(product: ProductFullPayload): EsProductDocument {
		const { minPrice, maxPrice } = this.getPriceRange(product);
		const thumbnailUrl = this.getThumbnailUrl(product);
		const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

		const specs: EsAttribute[] = this.mapFlatAttributes(product.specs).map(attr => ({
			...attr,
			numericValue: toNumericValue(attr.value)
		}));

		const variants: EsProductVariant[] = product.variants.map(v => ({
			id: v.id,
			sku: v.sku,
			price: Number(v.price),
			stock: v.stock,
			imageUrl: v.productImages[0]?.url ?? null,
			attributes: this.mapFlatAttributes(v.attributes).map(attr => ({
				...attr,
				numericValue: toNumericValue(attr.value)
			}))
		}));

		return {
			id: product.id,
			title: product.title,
			slug: product.slug,
			description: product.description,
			categoryId: product.category.id,
			categoryName: product.category.name,
			categorySlug: product.category.slug,
			sellerId: product.sellerId,
			minPrice,
			maxPrice,
			totalStock,
			inStock: totalStock > 0,
			thumbnailUrl,
			specs,
			variants,
			createdAt: product.createdAt,
			updatedAt: product.updatedAt
		};
	}

	toGraphQLDetails(product: ProductFullPayload): ProductDetails {
		const { minPrice, maxPrice } = this.getPriceRange(product);
		const thumbnailUrl = this.getThumbnailUrl(product);

		return {
			id: product.id,
			title: product.title,
			slug: product.slug,
			description: product.description,
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
			minPrice,
			maxPrice,
			thumbnailUrl,
			category: {
				id: product.category.id,
				name: product.category.name,
				slug: product.category.slug,
				icon: product.category.icon ?? undefined
			},
			seller: {
				id: product.seller.id,
				firstName: product.seller.firstName,
				lastName: product.seller.lastName
			},
			productImages: product.productImages.map(img => ({
				id: img.id,
				url: img.url,
				publicId: img.publicId
			})),
			specs: this.mapFlatAttributes(product.specs),
			variants: product.variants.map(variant => ({
				id: variant.id,
				sku: variant.sku,
				price: variant.price.toNumber(),
				stock: variant.stock,
				productImages: variant.productImages.map(img => ({
					id: img.id,
					url: img.url,
					publicId: img.publicId
				})),
				attributes: this.mapFlatAttributes(variant.attributes)
			}))
		};
	}

	private getPriceRange(product: ProductFullPayload) {
		const { minPrice, maxPrice } = product.variants.reduce(
			(acc, v) => {
				const price = Number(v.price);

				if (price < acc.minPrice) acc.minPrice = price;
				if (price > acc.maxPrice) acc.maxPrice = price;

				return acc;
			},
			{
				minPrice: Infinity,
				maxPrice: -Infinity
			}
		);

		const finalMin = minPrice === Infinity ? 0 : minPrice;
		const finalMax = maxPrice === -Infinity ? 0 : maxPrice;

		return { minPrice: finalMin, maxPrice: finalMax };
	}

	getThumbnailUrl(product: {
		productImages: Array<{ url: string }>;
		variants: Array<{ productImages: Array<{ url: string }> }>;
	}): string {
		return product.productImages[0]?.url ?? product.variants[0]?.productImages[0]?.url;
	}

	private mapFlatAttributes(items: Array<{ value: AttributeValuePayload }>) {
		return items.map(item => ({
			name: item.value.attribute.name,
			slug: item.value.attribute.slug,
			value: item.value.value
		}));
	}
}
