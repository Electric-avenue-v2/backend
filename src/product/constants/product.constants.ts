import type { Prisma } from '@prisma/client';

export const PRODUCT_FULL_INCLUDE = {
	variants: {
		include: {
			productImages: true,
			attributes: {
				include: {
					value: { include: { attribute: true } }
				}
			}
		}
	},
	specs: {
		include: { value: { include: { attribute: true } } }
	},
	category: true,
	seller: true,
	productImages: true
} satisfies Prisma.ProductInclude;

export const PRODUCT_LIST_INCLUDE = {
	variants: {
		select: {
			id: true,
			sku: true,
			price: true,
			stock: true,
			productImages: {
				take: 1
			}
		}
	},
	productImages: { take: 1 },
	category: true
} satisfies Prisma.ProductInclude;
