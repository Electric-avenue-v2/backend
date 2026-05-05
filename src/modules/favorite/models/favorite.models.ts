import { Field, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from '~/common/models';
import { ProductListItem } from '~/modules/search';

@ObjectType()
export class FavoriteProductsResult {
	@Field(() => [ProductListItem])
	items: ProductListItem[];

	@Field(() => PaginationMeta)
	pagination: PaginationMeta;
}
