import { InjectQueue } from '@nestjs/bullmq';
import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Queue } from 'bullmq';
import slugify from 'slugify';
import { PrismaService } from '~/prisma/prisma.service';
import { CreateProductInput } from '~/product/dto/create-product.input';
import { GetProductsInput } from '~/product/dto/get-products.input';
import { ProductFull, ProductList } from '~/product/types/product.types';
import { SearchService } from '~/search/search.service';
import { PRODUCT_FULL_INCLUDE, PRODUCT_LIST_INCLUDE } from './constants/product.constants';
import { ProductMapper } from './product.mapper';



























@Injectable()
export class ProductService {
	private readonly logger = new Logger(ProductService.name);

	constructor(
		private readonly prisma: PrismaService,
		private readonly searchService: SearchService,
		@InjectQueue('search-queue') private searchQueue: Queue
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
		const data = ProductMapper.toPrismaCreate(sellerId, slug, input);

		const product = await this.prisma.product.create({
			data,
			include: PRODUCT_FULL_INCLUDE
		});

		await this.addSearchJob(product.id);
		return product;
	}

	private async addSearchJob(productId: string): Promise<void> {
		await this.searchQueue.add(
			'index-product',
			{ productId },
			{
				attempts: 5,
				backoff: { type: 'exponential', delay: 1000 },
				removeOnComplete: true,
				removeOnFail: { count: 50 }
			}
		);
	}

	async getAll(input: GetProductsInput): Promise<{ items: ProductList[]; total: number }> {
		const { ids, total } = await this.searchService.searchProducts(input);

		if (ids.length === 0) return { items: [], total: 0 };

		const products = await this.prisma.product.findMany({
			where: { id: { in: ids } },
			include: PRODUCT_LIST_INCLUDE
		});

		const productMap = new Map(products.map(p => [p.id, p]));
		const ghostIds = ids.filter(id => !productMap.has(id));

		if (ghostIds.length > 0) {
			this.logger.warn(`Detected ${ghostIds.length} ghost products in index. Cleaning up...`);
			void this.cleanupGhostProducts(ghostIds);
		}

		const sortedProducts = ids
			.map(id => productMap.get(id))
			.filter((p): p is (typeof products)[0] => p !== undefined);

		return {
			items: sortedProducts,
			total: total - ghostIds.length
		};
	}

	private async cleanupGhostProducts(ids: string[]): Promise<void> {
		const jobs = ids.map(id =>
			this.searchQueue.add(
				'delete-product',
				{ productId: id },
				{ attempts: 3, removeOnComplete: true }
			)
		);

		await Promise.allSettled(jobs);
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
		if (product.sellerId !== sellerId)
			throw new ForbiddenException('You are not allowed to delete this product');

		const deletedProduct = await this.prisma.product.delete({
			where: { id },
			include: PRODUCT_FULL_INCLUDE
		});

		await this.addRemoveSearchJob(deletedProduct.id);

		return deletedProduct;
	}

	private async addRemoveSearchJob(productId: string): Promise<void> {
		await this.searchQueue.add(
			'delete-product',
			{ productId },
			{
				attempts: 3,
				removeOnComplete: true
			}
		);
	}

	private generateSlug(title: string): string {
		return slugify(`${title}-${Date.now()}`, { lower: true, strict: true });
	}
}
