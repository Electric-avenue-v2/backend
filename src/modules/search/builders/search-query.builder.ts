import type { QueryDslQueryContainer, SortCombinations } from '@elastic/elasticsearch/lib/api/types';
import { Injectable } from '@nestjs/common';
import type { CategoryProductsInput } from '../inputs/category-products.input';
import { ProductSort, type SearchProductsInput } from '../inputs/search-products.input';
import { SearchFiltersBuilder } from './search-filters.builder';

interface SearchQueryOptions {
	from: number;
	size: number;
	sort: SortCombinations[];
	query: QueryDslQueryContainer;
	post_filter: QueryDslQueryContainer;
}

const sortMap: Record<ProductSort, SortCombinations[]> = {
	[ProductSort.NEWEST]: [{ createdAt: 'desc' }],
	[ProductSort.PRICE_ASC]: [{ minPrice: 'asc' }],
	[ProductSort.PRICE_DESC]: [{ minPrice: 'desc' }],
	[ProductSort.POPULAR]: [{ totalStock: 'desc' }]
};

@Injectable()
export class SearchQueryBuilder {
	constructor(private readonly filtersBuilder: SearchFiltersBuilder) {}

	forSearch(input: SearchProductsInput): SearchQueryOptions {
		return {
			...this.buildPagination(input),
			sort: sortMap[input.sort],
			query: { bool: { must: this.buildTextQuery(input.query) } },
			post_filter: { bool: { must: this.filtersBuilder.buildAll(input) } }
		};
	}

	forCategory(input: CategoryProductsInput): SearchQueryOptions {
		return {
			...this.buildPagination(input),
			sort: sortMap[input.sort],
			query: { bool: { must: [{ term: { categorySlug: input.categorySlug } }] } },
			post_filter: { bool: { must: this.filtersBuilder.buildAll(input) } }
		};
	}

	private buildTextQuery(query: string | undefined): QueryDslQueryContainer[] {
		if (!query) return [{ match_all: {} }];

		return [
			{
				bool: {
					should: [
						{ match_phrase_prefix: { title: { query, boost: 3 } } },
						{ multi_match: { query, fields: ['title^3', 'description'], fuzziness: 'AUTO' } }
					],
					minimum_should_match: 1
				}
			}
		];
	}

	private buildPagination(input: SearchProductsInput): { from: number; size: number } {
		return {
			from: (input.page - 1) * input.limit,
			size: input.limit
		};
	}
}
