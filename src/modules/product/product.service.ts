import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException
} from '@nestjs/common';
import slugify from 'slugify';
import { PrismaService } from '~/infrastructure/prisma';
import { PRODUCT_FULL_INCLUDE } from './constants/product.constants';
import { CreateProductInput } from './inputs/create-product.input';
import { ProductMapper } from './mappers/product.mapper';
import { ProductDetails, ProductSeo } from './models/product.model';
import { ProductFull } from './types/product.types';

@Injectable()
export class ProductService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly productMapper: ProductMapper
	) {}

	async create(sellerId: string, input: CreateProductInput): Promise<ProductFull> {
		const hasGlobalImages = input.images && input.images.length > 0;
		const hasVariantImages = input.variants.some(v => v.images?.length > 0);

		if (!hasGlobalImages && !hasVariantImages) {
			throw new BadRequestException(
				'The product must have at least one image (general or variant).'
			);
		}

		const slug = this.generateSlug(input.title);
		const data = this.productMapper.toPrismaCreate(sellerId, slug, input);

		return this.prisma.product.create({
			data,
			include: PRODUCT_FULL_INCLUDE
		});
	}

	async getById(id: string): Promise<ProductDetails> {
		const product = await this.prisma.product.findUnique({
			where: { id },
			include: PRODUCT_FULL_INCLUDE
		});

		if (!product) throw new NotFoundException(`Product with ID "${id}" not found`);

		return this.productMapper.toGraphQLDetails(product);
	}

	async getSeoById(id: string): Promise<ProductSeo> {
		const product = await this.prisma.product.findUnique({
			where: { id },
			select: {
				id: true,
				title: true,
				description: true,
				productImages: { take: 1, select: { url: true } },
				variants: {
					take: 1,
					select: { productImages: { take: 1, select: { url: true } } }
				}
			}
		});

		if (!product) throw new NotFoundException('Product not found');

		const thumbnailUrl = this.productMapper.getThumbnailUrl(product);

		return {
			id: product.id,
			title: product.title,
			description: product.description,
			thumbnailUrl
		};
	}

	async delete(id: string, sellerId: string): Promise<ProductFull> {
		const product = await this.prisma.product.findUnique({
			where: { id },
			select: { sellerId: true, id: true }
		});

		if (!product) throw new NotFoundException(`Product with ID "${id}" not found`);
		if (product.sellerId !== sellerId)
			throw new ForbiddenException('You are not allowed to delete this product');

		return this.prisma.product.delete({
			where: { id },
			include: PRODUCT_FULL_INCLUDE
		});
	}

	private generateSlug(title: string): string {
		return slugify(`${title}-${Date.now()}`, { lower: true, strict: true });
	}
}
