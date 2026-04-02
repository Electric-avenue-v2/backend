import { PrismaService } from '~/infrastructure/prisma/prisma.service';
import { DebeziumRecord } from '../types/redis-consumer.types';
import { getString } from '../utils/redis-consumer.utils';

type ProductIdResolver = (record: DebeziumRecord, prisma: PrismaService) => Promise<string | null>;

export const STREAM_RESOLVERS: Record<string, ProductIdResolver> = {
	'db.public.products': record => Promise.resolve(getString(record, 'id')),

	'db.public.product_variants': record => Promise.resolve(getString(record, 'product_id')),

	'db.public.product_images': async (record, prisma) => {
		const productId = getString(record, 'product_id');
		if (productId !== null) return productId;

		const variantId = getString(record, 'product_variant_id');
		if (variantId === null) return null;

		const variant = await prisma.productVariant.findUnique({
			where: { id: variantId },
			select: { productId: true }
		});

		return variant?.productId ?? null;
	},

	'db.public.product_attribute_values': record => Promise.resolve(getString(record, 'product_id')),

	'db.public.variant_attribute_values': async (record, prisma) => {
		const variantId = getString(record, 'variant_id');
		if (variantId === null) return null;

		const variant = await prisma.productVariant.findUnique({
			where: { id: variantId },
			select: { productId: true }
		});

		return variant?.productId ?? null;
	}
};

export const ALL_STREAM_KEYS = Object.keys(STREAM_RESOLVERS);
