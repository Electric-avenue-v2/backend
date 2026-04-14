import type { AggregationsAggregate, SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { Injectable } from '@nestjs/common';
import type { EsProductDocument } from '~/modules/product/types/es-product.types';
import { SearchProductsInput } from '../inputs/search-products.input';
import type {
	AttributeAggregation,
	AttributeValueAggregation,
	PriceRangeAggregation
} from '../models/attribute-aggregation.model';
import type { ProductListItem, SearchResult } from '../models/search-result.model';
import type { EsAggregations, EsAttributeBucket } from '../types/search-mapper.types';
import { isEsAggregations } from '../utils/search.utils';

export const listFields = [
	'id',
	'title',
	'slug',
	'minPrice',
	'maxPrice',
	'inStock',
	'thumbnailUrl',
	'categorySlug',
	'categoryName',
	'sellerId',
] as const;

export type ListSource = Pick<EsProductDocument, (typeof listFields)[number]>;

@Injectable()
export class SearchResultMapper {
	toSearchResult(
		response: SearchResponse<ListSource, Record<string, AggregationsAggregate>>,
		input: SearchProductsInput
	): SearchResult {
		const totalItems = this.mapTotal(response);
		const totalPages = Math.ceil(totalItems / input.limit);

		const rawAggs = response.aggregations;
		const aggs = isEsAggregations(rawAggs) ? rawAggs : undefined;

		return {
			items: this.mapItems(response),
			pagination: {
				currentPage: input.page,
				totalItems,
				totalPages,
				itemsPerPage: input.limit,
				hasNextPage: input.page < totalPages,
				hasPrevPage: input.page > 1
			},
			aggregations: {
				attributes: this.mapAttributes(aggs),
				priceRange: this.mapPriceRange(aggs)
			}
		};
	}

	private mapItems(response: SearchResponse<ListSource, Record<string, AggregationsAggregate>>): ProductListItem[] {
		return response.hits.hits
			.filter((hit): hit is typeof hit & { _source: ListSource } => hit._source !== undefined)
			.map(hit => hit._source);
	}

	private mapTotal(response: SearchResponse<ListSource, Record<string, AggregationsAggregate>>): number {
		return typeof response.hits.total === 'number' ? response.hits.total : (response.hits.total?.value ?? 0);
	}

	private mapAttributes(aggs: EsAggregations | undefined): AttributeAggregation[] {
		if (!aggs) return [];

		const result = new Map<string, AttributeAggregation>();

		for (const bucket of aggs.specs_agg.slugs.buckets) {
			result.set(bucket.key, this.bucketToAggregation(bucket));
		}

		for (const bucket of aggs.variant_attrs_agg.attrs.slugs.buckets) {
			const existing = result.get(bucket.key);
			if (existing) {
				existing.values = this.mergeValueCounts(existing.values, bucket.values.buckets);
			} else {
				result.set(bucket.key, this.bucketToAggregation(bucket));
			}
		}

		return Array.from(result.values());
	}

	private bucketToAggregation(bucket: {
		key: string;
		names: { buckets: { key: string }[] };
		values: { buckets: EsAttributeBucket[] };
	}): AttributeAggregation {
		return {
			slug: bucket.key,
			name: bucket.names.buckets[0]?.key ?? bucket.key,
			values: bucket.values.buckets.map(v => ({ value: v.key, count: v.doc_count }))
		};
	}

	private mergeValueCounts(
		existing: AttributeValueAggregation[],
		incoming: EsAttributeBucket[]
	): AttributeValueAggregation[] {
		const map = new Map(existing.map(v => [v.value, v.count]));
		for (const { key, doc_count } of incoming) {
			map.set(key, (map.get(key) ?? 0) + doc_count);
		}
		return Array.from(map.entries()).map(([value, count]) => ({ value, count }));
	}

	private mapPriceRange(aggs: EsAggregations | undefined): PriceRangeAggregation | null {
		if (!aggs) return null;
		const { value: min } = aggs.price_min;
		const { value: max } = aggs.price_max;
		if (min === null || max === null) return null;
		return { min, max };
	}
}
