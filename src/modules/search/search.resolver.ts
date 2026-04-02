import { Args, Query, Resolver } from '@nestjs/graphql';
import { Public } from '~/common/decorators';
import { CategoryProductsInput } from './inputs/category-products.input';
import { SearchProductsInput } from './inputs/search-products.input';
import { SearchSuggestionsInput } from './inputs/search-suggestions.input';
import { SearchResult } from './models/search-result.model';
import { SearchSuggestion } from './models/search-suggestion.model';
import { SearchService } from './search.service';

@Resolver()
export class SearchResolver {
	constructor(private readonly searchService: SearchService) {}

	@Public()
	@Query(() => [SearchSuggestion], { name: 'searchSuggestions' })
	async getSuggestions(@Args('input') input: SearchSuggestionsInput): Promise<SearchSuggestion[]> {
		return this.searchService.getSuggestions(input);
	}

	@Public()
	@Query(() => SearchResult, { name: 'searchProducts' })
	async searchProducts(@Args('input') input: SearchProductsInput): Promise<SearchResult> {
		return this.searchService.searchProducts(input);
	}

	@Public()
	@Query(() => SearchResult, { name: 'categoryProducts' })
	async getCategoryProducts(@Args('input') input: CategoryProductsInput): Promise<SearchResult> {
		return this.searchService.getCategoryProducts(input);
	}
}
