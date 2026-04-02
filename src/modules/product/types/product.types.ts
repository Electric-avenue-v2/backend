import type {
	Prisma,
	ProductImage as PrismaImage,
	Product as PrismaProduct,
	ProductVariant as PrismaVariant
} from '@prisma/client';
import type { PRODUCT_FULL_INCLUDE } from '../constants/product.constants';

export type ProductPayload = PrismaProduct & {
	variants?: (PrismaVariant & { productImages: PrismaImage[] })[];
	productImages?: PrismaImage[];
	specs?: unknown[];
};

export type ProductFull = Prisma.ProductGetPayload<{ include: typeof PRODUCT_FULL_INCLUDE }>;
