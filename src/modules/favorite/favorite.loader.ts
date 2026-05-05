import { Injectable, Scope } from '@nestjs/common';
import DataLoader from 'dataloader';
import { FavoriteService } from './favorite.service';

@Injectable({ scope: Scope.REQUEST })
export class FavoriteLoader {
	private loaders = new Map<string, DataLoader<string, boolean>>();

	constructor(private readonly favoriteService: FavoriteService) {}

	load(userId: string, productId: string): Promise<boolean> {
		let loader = this.loaders.get(userId);

		if (!loader) {
			loader = new DataLoader<string, boolean>(async productIds => {
				const map = await this.favoriteService.isLikedBatch(userId, [...productIds]);
				return productIds.map(id => map.get(id) ?? false);
			});

			this.loaders.set(userId, loader);
		}

		return loader.load(productId);
	}
}
