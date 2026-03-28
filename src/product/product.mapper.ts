import type { Prisma } from '@prisma/client';
import type { CreateProductInput } from '~/product/dto/create-product.input';

export class ProductMapper {
	static toPrismaCreate(
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
}
