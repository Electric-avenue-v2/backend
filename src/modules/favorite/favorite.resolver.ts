import { Args, Context, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GetCurrentUserId, Public } from '~/common/decorators';
import { GraphqlContext } from '~/infrastructure/graphql/types/graphql.types';
import { ProductListItem } from '~/modules/search';
import { FavoriteLoader } from './favorite.loader';
import { FavoriteService } from './favorite.service';
import { FavoriteProductsInput, GuestFavoriteProductsInput, SyncFavoritesInput } from './inputs/favorite.input';
import { FavoriteProductsResult } from './models/favorite.models';

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
		if (input.productIds.length === 0) return true;
		return this.favoriteService.syncFavorites(userId, input.productIds);
	}

	@Query(() => FavoriteProductsResult, { name: 'favoriteProducts' })
	async getFavoriteProducts(
		@GetCurrentUserId() userId: string,
		@Args('input') input: FavoriteProductsInput
	): Promise<FavoriteProductsResult> {
		return this.favoriteService.getFavoriteProducts(userId, input);
	}

	@Public()
	@Query(() => FavoriteProductsResult, { name: 'guestFavoriteProducts' })
	async getGuestFavoriteProducts(@Args('input') input: GuestFavoriteProductsInput): Promise<FavoriteProductsResult> {
		return this.favoriteService.getGuestFavoriteProducts(input);
	}
}
