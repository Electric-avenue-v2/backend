import type { Prisma } from '@prisma/client';
import { PRODUCT_FULL_INCLUDE } from '../constants/product.constants';
import type { CreateProductInput } from '../inputs/create-product.input';
import type { EsAttribute, EsProductDocument, EsProductVariant } from '../types/es-product.types';

type ProductFullPayload = Prisma.ProductGetPayload<{ include: typeof PRODUCT_FULL_INCLUDE }>;

export class ProductMapper {
	static toPrismaCreate(sellerId: string, slug: string, input: CreateProductInput): Prisma.ProductCreateInput {
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

	static toEsDocument(product: ProductFullPayload): EsProductDocument {
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

		const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);

		const thumbnailUrl = product.productImages[0]?.url ?? product.variants[0]?.productImages[0]?.url ?? null;

		const specs: EsAttribute[] = product.specs.map(spec => ({
			slug: spec.value.attribute.slug,
			name: spec.value.attribute.name,
			value: spec.value.value,
			numericValue: ProductMapper.toNumericValue(spec.value.value)
		}));

		const variants: EsProductVariant[] = product.variants.map(v => ({
			id: v.id,
			sku: v.sku,
			price: Number(v.price),
			stock: v.stock,
			imageUrl: v.productImages[0]?.url ?? null,
			attributes: v.attributes.map(attr => ({
				slug: attr.value.attribute.slug,
				name: attr.value.attribute.name,
				value: attr.value.value,
				numericValue: ProductMapper.toNumericValue(attr.value.value)
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
			minPrice: finalMin,
			maxPrice: finalMax,
			totalStock,
			inStock: totalStock > 0,
			thumbnailUrl,
			specs,
			variants,
			createdAt: product.createdAt,
			updatedAt: product.updatedAt
		};
	}

	private static toNumericValue(value: string): number | null {
		const parsed = Number(value);
		return isNaN(parsed) ? null : parsed;
	}
}
