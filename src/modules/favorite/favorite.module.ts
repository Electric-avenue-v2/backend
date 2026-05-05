import { Module } from '@nestjs/common';
import { SearchModule } from '~/modules/search';
import { FavoriteBuilder } from './builders/favorite.builder';
import { FavoriteLoader } from './favorite.loader';
import { FavoriteResolver } from './favorite.resolver';
import { FavoriteService } from './favorite.service';

@Module({
	imports: [SearchModule],
	providers: [FavoriteResolver, FavoriteService, FavoriteLoader, FavoriteBuilder]
})
export class FavoriteModule {}
