import { Args, Context, Mutation, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import { GetCurrentUserId } from '~/common/decorators';
import { GraphqlContext } from '~/infrastructure/graphql/types/graphql.types';
import { ProductListItem } from '~/modules/search/models/search-result.model';
import { FavoriteLoader } from './favorite.loader';
import { FavoriteService } from './favorite.service';
import { SyncFavoritesInput } from './inputs/favorite.input';

@Resolver(() => ProductListItem)
export class FavoriteResolver {
	constructor(
		private readonly favoriteService: FavoriteService,
		private readonly favoritesLoader: FavoriteLoader
	) {}

	@ResolveField(() => Boolean)
	async isLiked(@Parent() product: ProductListItem, @Context() ctx: GraphqlContext): Promise<boolean> {
		const sub = ctx.req.user?.sub;
		if (!sub) return false;

		return this.favoritesLoader.load(sub, product.id);
	}

	@Mutation(() => Boolean)
	async addFavorite(@Args('productId') productId: string, @GetCurrentUserId() userId: string): Promise<boolean> {
		return this.favoriteService.addFavorite(userId, productId);
	}

	@Mutation(() => Boolean)
	async removeFavorite(@Args('productId') productId: string, @GetCurrentUserId() userId: string): Promise<boolean> {
		return this.favoriteService.removeFavorite(userId, productId);
	}

	@Mutation(() => Boolean)
	async syncFavorites(@Args('input') input: SyncFavoritesInput, @GetCurrentUserId() userId: string): Promise<boolean> {
		if (input.productIds.length === 0) {
			return true;
		}

		return this.favoriteService.syncFavorites(userId, input.productIds);
	}
}
