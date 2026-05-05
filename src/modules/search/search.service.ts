import type { AggregationsAggregate } from '@elastic/elasticsearch/lib/api/types';
import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PRODUCT_INDEX_NAME } from '~/modules/product/constants/product.constants';
import { SearchAggregationsBuilder } from './builders/search-aggregations.builder';
import { SearchQueryBuilder } from './builders/search-query.builder';
import type { CategoryProductsInput } from './inputs/category-products.input';
import type { SearchProductsInput } from './inputs/search-products.input';
import type { SearchSuggestionsInput } from './inputs/search-suggestions.input';
import { listFields, type ListSource, SearchResultMapper } from './mappers/search-result.mapper';
import { SearchSuggestionMapper, suggestionFields, type SuggestionSource } from './mappers/search-suggestion.mapper';
import { ProductListItem, SearchResult } from './models/search-result.model';
import type { SearchSuggestion } from './models/search-suggestion.model';

@Injectable()
export class SearchService {
	constructor(
		private readonly elasticsearchService: ElasticsearchService,
		private readonly queryBuilder: SearchQueryBuilder,
		private readonly aggsBuilder: SearchAggregationsBuilder,
		private readonly resultMapper: SearchResultMapper,
		private readonly suggestionMapper: SearchSuggestionMapper
	) {}

	async getSuggestions(input: SearchSuggestionsInput): Promise<SearchSuggestion[]> {
		const result = await this.elasticsearchService.search<SuggestionSource>({
			index: PRODUCT_INDEX_NAME,
			_source: [...suggestionFields],
			size: 5,
			query: {
				bool: {
					should: [
						{ match_phrase: { title: { query: input.query, boost: 10 } } },
						{ match: { 'title.autocomplete': { query: input.query, operator: 'and', boost: 5 } } },
						{ match: { title: { query: input.query, fuzziness: 'AUTO', operator: 'and', boost: 2 } } }
					],
					filter: [{ term: { inStock: true } }],
					minimum_should_match: 1
				}
			}
		});

		return result.hits.hits
			.filter((hit): hit is typeof hit & { _source: SuggestionSource } => hit._source !== undefined)
			.map(hit => this.suggestionMapper.toSuggestion(hit._source));
	}

	async searchProducts(input: SearchProductsInput): Promise<SearchResult> {
		const response = await this.elasticsearchService.search<ListSource, Record<string, AggregationsAggregate>>({
			index: PRODUCT_INDEX_NAME,
			...this.queryBuilder.forSearch(input),
			aggs: this.aggsBuilder.build(),
			_source: [...listFields]
		});

		return this.resultMapper.toSearchResult(response, input);
	}

	async getCategoryProducts(input: CategoryProductsInput): Promise<SearchResult> {
		const response = await this.elasticsearchService.search<ListSource, Record<string, AggregationsAggregate>>({
			index: PRODUCT_INDEX_NAME,
			...this.queryBuilder.forCategory(input),
			aggs: this.aggsBuilder.build(),
			_source: [...listFields]
		});

		return this.resultMapper.toSearchResult(response, input);
	}

	async getProductsByIds(ids: string[]): Promise<ProductListItem[]> {
		if (ids.length === 0) return [];

		const response = await this.elasticsearchService.search<ListSource>({
			index: PRODUCT_INDEX_NAME,
			_source: [...listFields],
			size: ids.length,
			query: {
				terms: { id: ids }
			}
		});

		return this.resultMapper.mapItems(response);
	}
}
