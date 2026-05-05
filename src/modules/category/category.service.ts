import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { PrismaService } from '~/infrastructure/prisma';
import type { Category, CategorySitemapInfo } from './models/category.model';

const CATEGORIES_CACHE_KEY = 'categories:tree';

@Injectable()
export class CategoryService {
	constructor(
		private readonly prisma: PrismaService,
		@Inject(CACHE_MANAGER) private readonly cache: Cache
	) {}

	async getAll(): Promise<Category[]> {
		const cached = await this.cache.get<Category[]>(CATEGORIES_CACHE_KEY);
		if (cached) return cached;

		const all = await this.prisma.category.findMany();

		await this.cache.set(CATEGORIES_CACHE_KEY, all);
		return all;
	}

	async invalidateCache(): Promise<boolean> {
		await this.cache.del(CATEGORIES_CACHE_KEY);
		return true;
	}

	async getBySlug(slug: string): Promise<Category | null> {
		return this.prisma.category.findUnique({
			where: { slug }
		});
	}

	async getSitemapInfo(): Promise<CategorySitemapInfo[]> {
		const categories = await this.prisma.category.findMany({
			select: {
				slug: true,
				updatedAt: true,
				products: {
					orderBy: { updatedAt: 'desc' },
					take: 1,
					select: { updatedAt: true }
				}
			}
		});

		return categories.map(category => {
			const latestProductDate = category.products[0]?.updatedAt;

			const lastModified =
				latestProductDate && latestProductDate > category.updatedAt
					? latestProductDate
					: category.updatedAt;

			return {
				slug: category.slug,
				lastModified
			};
		});
	}
}
