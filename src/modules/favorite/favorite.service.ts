import { Injectable } from '@nestjs/common';
import { PrismaService } from '~/infrastructure/prisma';
import { FavoriteBuilder } from './builders/favorite.builder';
import { FavoriteProductsInput, GuestFavoriteProductsInput } from './inputs/favorite.input';
import { FavoriteProductsResult } from './models/favorite.models';








@Injectable()
export class FavoriteService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly favoriteBuilder: FavoriteBuilder
	) {}

	async isLikedBatch(userId: string, productIds: string[]): Promise<Map<string, boolean>> {
		const favorites = await this.prisma.favorite.findMany({
			where: { userId, productId: { in: productIds } },
			select: { productId: true }
		});

		const likedSet = new Set(favorites.map(f => f.productId));
		return new Map(productIds.map(id => [id, likedSet.has(id)]));
	}

	async addFavorite(userId: string, productId: string): Promise<boolean> {
		await this.prisma.favorite.upsert({
			where: {
				userId_productId: {
					userId,
					productId
				}
			},
			update: {},
			create: {
				userId,
				productId
			}
		});

		return true;
	}

	async removeFavorite(userId: string, productId: string): Promise<boolean> {
		await this.prisma.favorite.deleteMany({
			where: { userId, productId }
		});

		return true;
	}

	async syncFavorites(userId: string, productIds: string[]): Promise<boolean> {
		await this.prisma.favorite.createMany({
			data: productIds.map(productId => ({
				userId,
				productId
			})),
			skipDuplicates: true
		});

		return true;
	}

	async getFavoriteProducts(
		userId: string,
		input: FavoriteProductsInput
	): Promise<FavoriteProductsResult> {
		const { page, limit } = input;
		const skip = (page - 1) * limit;

		const [totalItems, favoriteRecords] = await Promise.all([
			this.prisma.favorite.count({ where: { userId } }),
			this.prisma.favorite.findMany({
				where: { userId },
				orderBy: { createdAt: 'desc' },
				skip,
				take: limit,
				select: { productId: true }
			})
		]);

		const currentIds = favoriteRecords.map(record => record.productId);

		return this.favoriteBuilder.buildPaginatedResult(currentIds, totalItems, page, limit);
	}

	async getGuestFavoriteProducts(
		input: GuestFavoriteProductsInput
	): Promise<FavoriteProductsResult> {
		const { productIds, page, limit } = input;
		const totalItems = productIds.length;
		const skip = (page - 1) * limit;

		const sortedIds = productIds
			.toSorted((a, b) => b.addedAt - a.addedAt)
			.slice(skip, skip + limit)
			.map(item => item.productId);

		return this.favoriteBuilder.buildPaginatedResult(sortedIds, totalItems, page, limit);
	}
}
