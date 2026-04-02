import { Field, Int, ObjectType } from '@nestjs/graphql';
import { SearchAggregations } from './attribute-aggregation.model';

@ObjectType()
export class ProductListItem {
	@Field()
	id: string;

	@Field()
	title: string;

	@Field()
	slug: string;

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
}

@ObjectType()
export class PaginationMeta {
	@Field(() => Int)
	currentPage: number;

	@Field(() => Int)
	totalPages: number;

	@Field(() => Int)
	totalItems: number;

	@Field(() => Int)
	itemsPerPage: number;

	@Field()
	hasNextPage: boolean;

	@Field()
	hasPrevPage: boolean;
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
