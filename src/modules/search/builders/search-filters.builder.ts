import type { QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import { Injectable } from '@nestjs/common';
import type { AttributeFilterInput, SearchProductsInput } from '../inputs/search-products.input';

@Injectable()
export class SearchFiltersBuilder {
	buildAll(input: SearchProductsInput): QueryDslQueryContainer[] {
		return [...this.buildBaseFilters(input), ...this.buildAllAttributeFilters(input)];
	}

	buildExcluding(input: SearchProductsInput, excludeSlug: string): QueryDslQueryContainer[] {
		return [
			...this.buildBaseFilters(input),
			...(input.attributes ?? [])
				.filter(attr => attr.slug !== excludeSlug)
				.flatMap(attr => this.buildAttributeFilter(attr))
		];
	}

	buildBase(input: SearchProductsInput): QueryDslQueryContainer[] {
		return this.buildBaseFilters(input);
	}

	private buildBaseFilters(input: SearchProductsInput): QueryDslQueryContainer[] {
		const filters: QueryDslQueryContainer[] = [];

		if (input.inStock === true) {
			filters.push({ term: { inStock: true } });
		}

		if (input.minPrice !== undefined || input.maxPrice !== undefined) {
			filters.push({
				range: {
					minPrice: {
						...(input.minPrice !== undefined && { gte: input.minPrice }),
						...(input.maxPrice !== undefined && { lte: input.maxPrice })
					}
				}
			});
		}

		return filters;
	}

	private buildAllAttributeFilters(input: SearchProductsInput): QueryDslQueryContainer[] {
		return (input.attributes ?? []).flatMap(attr => this.buildAttributeFilter(attr));
	}

	buildAttributeFilter(attr: AttributeFilterInput): QueryDslQueryContainer[] {
		return [
			{
				bool: {
					should: [
						{
							nested: {
								path: 'specs',
								query: {
									bool: {
										must: [{ term: { 'specs.slug': attr.slug } }, { terms: { 'specs.value': attr.values } }]
									}
								}
							}
						},
						{
							nested: {
								path: 'variants',
								query: {
									nested: {
										path: 'variants.attributes',
										query: {
											bool: {
												must: [
													{ term: { 'variants.attributes.slug': attr.slug } },
													{ terms: { 'variants.attributes.value': attr.values } }
												]
											}
										}
									}
								}
							}
						}
					],
					minimum_should_match: 1
				}
			}
		];
	}
}
