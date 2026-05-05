import { Field, Int, ObjectType } from '@nestjs/graphql';
import { PaginationMeta } from '~/common/models';
import { SearchAggregations } from './attribute-aggregation.model';

@ObjectType()
export class ProductListItem {
	@Field()
	id: string;

	@Field()
	title: string;

	@Field()
	slug: string;

	@Field()
	sellerId: string;

	@Field(() => Number)
	minPrice: number;

	@Field(() => Number)
	maxPrice: number;

	@Field()
	inStock: boolean;

	@Field(() => String, { nullable: true })
	thumbnailUrl: string | null;

	@Field()
	categorySlug: string;

	@Field()
	categoryName: string;

	@Field(() => Boolean, { nullable: true })
	isLiked?: boolean;
}

@ObjectType()
export class SearchResult {
	@Field(() => [ProductListItem])
	items: ProductListItem[];

	@Field(() => PaginationMeta)
	pagination: PaginationMeta;

	@Field(() => SearchAggregations)
	aggregations: SearchAggregations;
}
