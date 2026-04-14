import { Injectable } from '@nestjs/common';
import { PrismaService } from '~/infrastructure/prisma/prisma.service';

@Injectable()
export class FavoriteService {
	constructor(private readonly prisma: PrismaService) {}

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

	async getUserFavoriteIds(userId: string): Promise<string[]> {
		const favorites = await this.prisma.favorite.findMany({
			where: { userId },
			select: { productId: true }
		});
		return favorites.map(f => f.productId);
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
}
