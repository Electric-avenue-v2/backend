import { Module } from '@nestjs/common';
import { FavoriteLoader } from '~/modules/favorite/favorite.loader';
import { FavoriteResolver } from './favorite.resolver';
import { FavoriteService } from './favorite.service';

@Module({
	providers: [FavoriteResolver, FavoriteService, FavoriteLoader]
})
export class FavoriteModule {}
