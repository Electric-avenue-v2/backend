import type { Prisma } from '@prisma/client';

export const PRODUCT_INDEX_NAME = 'products';

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
} as const satisfies Prisma.ProductInclude;
