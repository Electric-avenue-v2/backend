import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from '~/infrastructure/prisma/prisma.service';
import { PRODUCT_FULL_INCLUDE } from './constants/product.constants';
import { CreateProductInput } from './inputs/create-product.input';
import { ProductFull } from './types/product.types';
import { ProductMapper } from './utils/product.mapper';

@Injectable()
export class ProductService {
	constructor(private readonly prisma: PrismaService) {}

	async create(sellerId: string, input: CreateProductInput): Promise<ProductFull> {
		const hasGlobalImages = input.images && input.images.length > 0;
		const hasVariantImages = input.variants.some(v => v.images?.length > 0);

		if (!hasGlobalImages && !hasVariantImages) {
			throw new BadRequestException('The product must have at least one image (general or variant).');
		}

		const slug = this.generateSlug(input.title);
		const data = ProductMapper.toPrismaCreate(sellerId, slug, input);

		return this.prisma.product.create({
			data,
			include: PRODUCT_FULL_INCLUDE
		});
	}

	async getById(id: string): Promise<ProductFull> {
		const product = await this.prisma.product.findUnique({
			where: { id },
			include: PRODUCT_FULL_INCLUDE
		});

		if (!product) throw new NotFoundException(`Product with ID "${id}" not found`);

		return product;
	}

	async delete(id: string, sellerId: string): Promise<ProductFull> {
		const product = await this.prisma.product.findUnique({
			where: { id },
			select: { sellerId: true, id: true }
		});

		if (!product) throw new NotFoundException(`Product with ID "${id}" not found`);
		if (product.sellerId !== sellerId) throw new ForbiddenException('You are not allowed to delete this product');

		return this.prisma.product.delete({
			where: { id },
			include: PRODUCT_FULL_INCLUDE
		});
	}

	private generateSlug(title: string): string {
		return slugify(`${title}-${Date.now()}`, { lower: true, strict: true });
	}
}
