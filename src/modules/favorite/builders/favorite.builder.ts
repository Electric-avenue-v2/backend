import { Injectable } from '@nestjs/common';
import { type ProductListItem, SearchService } from '~/modules/search';
import { type FavoriteProductsResult } from '../models/favorite.models';

@Injectable()
export class FavoriteBuilder {
	constructor(private readonly searchService: SearchService) {}

	public async buildPaginatedResult(
		currentIds: string[],
		totalItems: number,
		page: number,
		limit: number
	): Promise<FavoriteProductsResult> {
		const totalPages = Math.ceil(totalItems / limit) || 1;

		if (currentIds.length === 0) {
			return {
				items: [],
				pagination: {
					currentPage: page,
					totalPages,
					totalItems,
					itemsPerPage: limit,
					hasNextPage: false,
					hasPrevPage: false
				}
			};
		}

		const esProducts = await this.searchService.getProductsByIds(currentIds);

		const productMap = new Map<string, ProductListItem>(esProducts.map(p => [p.id, p]));

		const items: ProductListItem[] = [];

		for (const id of currentIds) {
			const product = productMap.get(id);
			if (product) {
				items.push({
					...product,
					isLiked: true
				});
			}
		}

		return {
			items,
			pagination: {
				currentPage: page,
				totalPages,
				totalItems,
				itemsPerPage: limit,
				hasNextPage: page < totalPages,
				hasPrevPage: page > 1
			}
		};
	}
}
