import { Module } from '@nestjs/common';
import { ElasticSearchModule } from '~/infrastructure/elastic-search/elastic-search.module';
import { SearchAggregationsBuilder } from './builders/search-aggregations.builder';
import { SearchFiltersBuilder } from './builders/search-filters.builder';
import { SearchQueryBuilder } from './builders/search-query.builder';
import { SearchResultMapper } from './mappers/search-result.mapper';
import { SearchSuggestionMapper } from './mappers/search-suggestion.mapper';
import { SearchResolver } from './search.resolver';
import { SearchService } from './search.service';

@Module({
	imports: [ElasticSearchModule],
	providers: [
		SearchResolver,
		SearchAggregationsBuilder,
		SearchFiltersBuilder,
		SearchQueryBuilder,
		SearchResultMapper,
		SearchSuggestionMapper,
		SearchService
	]
})
export class SearchModule {}
