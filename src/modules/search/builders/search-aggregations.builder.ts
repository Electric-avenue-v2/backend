import type { AggregationsAggregationContainer, QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { Injectable } from '@nestjs/common';
import type { SearchProductsInput } from '../inputs/search-products.input';
import { SearchFiltersBuilder } from './search-filters.builder';

@Injectable()
export class SearchAggregationsBuilder {
	constructor(private readonly filtersBuilder: SearchFiltersBuilder) {}

	build(input: SearchProductsInput): Record<string, AggregationsAggregationContainer> {
		const activeAttributes = input.attributes ?? [];

		const activeSlugs = new Set(activeAttributes.map(a => a.slug));

		const perFacetAggs = Object.fromEntries(
			[...activeSlugs].map(slug => [
				`facet_${slug}`,
				this.buildPerFacetAgg(slug, this.filtersBuilder.buildExcluding(input, slug))
			])
		);

		return {
			specs_agg: this.buildSpecsAgg(),
			variant_attrs_agg: this.buildVariantAttrsAgg(),
			price_min: { min: { field: 'minPrice' } },
			price_max: { max: { field: 'maxPrice' } },
			...perFacetAggs
		};
	}

	private buildPerFacetAgg(slug: string, otherFilters: QueryDslQueryContainer[]): AggregationsAggregationContainer {
		return {
			filter: { bool: { must: otherFilters } },
			aggs: {
				specs: {
					nested: { path: 'specs' },
					aggs: {
						by_slug: {
							filter: { term: { 'specs.slug': slug } },
							aggs: {
								values: { terms: { field: 'specs.value', size: 50 } }
							}
						}
					}
				},
				variant_attrs: {
					nested: { path: 'variants' },
					aggs: {
						attrs: {
							nested: { path: 'variants.attributes' },
							aggs: {
								by_slug: {
									filter: { term: { 'variants.attributes.slug': slug } },
									aggs: {
										values: { terms: { field: 'variants.attributes.value', size: 50 } }
									}
								}
							}
						}
					}
				}
			}
		};
	}

	private buildSpecsAgg(): AggregationsAggregationContainer {
		return {
			nested: { path: 'specs' },
			aggs: {
				slugs: {
					terms: { field: 'specs.slug', size: 20 },
					aggs: {
						names: { terms: { field: 'specs.name', size: 1 } },
						values: { terms: { field: 'specs.value', size: 50 } }
					}
				}
			}
		};
	}

	private buildVariantAttrsAgg(): AggregationsAggregationContainer {
		return {
			nested: { path: 'variants' },
			aggs: {
				attrs: {
					nested: { path: 'variants.attributes' },
					aggs: {
						slugs: {
							terms: { field: 'variants.attributes.slug', size: 20 },
							aggs: {
								names: { terms: { field: 'variants.attributes.name', size: 1 } },
								values: { terms: { field: 'variants.attributes.value', size: 50 } }
							}
						}
					}
				}
			}
		};
	}
}
