import type { AggregationsAggregationContainer } from '@elastic/elasticsearch/lib/api/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SearchAggregationsBuilder {
	build(): Record<string, AggregationsAggregationContainer> {
		return {
			specs_agg: this.buildSpecsAgg(),
			variant_attrs_agg: this.buildVariantAttrsAgg(),
			price_min: { min: { field: 'minPrice' } },
			price_max: { max: { field: 'maxPrice' } }
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
