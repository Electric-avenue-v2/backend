import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@opensearch-project/opensearch';
import { Index_Response } from '@opensearch-project/opensearch/api';
import { Attribute, AttributeValue, Product, ProductImage, ProductVariant } from '@prisma/client';
import { GetProductsInput } from '~/product/dto/get-products.input';
import { ProductSearchBody, TypedApiResponse } from '~/search/types/opensearch.types';
import { QueryDsl } from '~/search/types/search.types';
import { OPENSEARCH_CLIENT } from './search.config';

export type FullProduct = Product & {
	category: { name: string; slug: string };
	specs: { value: AttributeValue & { attribute: Attribute } }[];
	productImages?: ProductImage[];
	variants: (ProductVariant & {
		attributes: { value: AttributeValue & { attribute: Attribute } }[];
		productImages: ProductImage[];
	})[];
};

@Injectable()
export class SearchService implements OnModuleInit {
	private readonly logger = new Logger(SearchService.name);
	private readonly indexName = 'products';

	constructor(@Inject(OPENSEARCH_CLIENT) private readonly client: Client) {}

	async onModuleInit(): Promise<void> {
		const { body: indexExists } = await this.client.indices.exists({
			index: this.indexName
		});

		if (!indexExists) {
			await this.client.indices.create({
				index: this.indexName,
				body: {
					settings: {
						analysis: {
							analyzer: {
								standard_ngram: {
									type: 'custom',
									tokenizer: 'standard',
									filter: ['lowercase', 'ngram_filter']
								}
							},
							filter: {
								ngram_filter: {
									type: 'edge_ngram',
									min_gram: 2,
									max_gram: 20
								}
							}
						}
					},
					mappings: {
						properties: {
							id: { type: 'keyword' },
							title: {
								type: 'text',
								analyzer: 'standard_ngram',
								search_analyzer: 'standard'
							},
							slug: { type: 'keyword' },
							description: { type: 'text' },
							category_id: { type: 'keyword' },
							price_min: { type: 'float' },
							price_max: { type: 'float' },
							total_stock: { type: 'integer' },
							created_at: { type: 'date' },
							attributes: {
								type: 'nested',
								properties: {
									key: { type: 'keyword' },
									name: { type: 'text' },
									value: { type: 'keyword' }
								}
							}
						}
					}
				}
			});

			this.logger.log(`Index "${this.indexName}" created.`);
		}
	}

	async indexProduct(product: FullProduct): Promise<Index_Response> {
		const prices = product.variants.map(v => Number(v.price));
		const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
		const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;
		const totalStock = product.variants.reduce((acc, v) => acc + v.stock, 0);

		const attributesMap = new Map<string, { key: string; name: string; value: string }>();

		product.specs.forEach(spec => {
			const uniqueKey = `${spec.value.attribute.slug}_${spec.value.value}`;
			attributesMap.set(uniqueKey, {
				key: spec.value.attribute.slug,
				name: spec.value.attribute.name,
				value: spec.value.value
			});
		});

		product.variants.forEach(variant => {
			variant.attributes.forEach(attr => {
				const uniqueKey = `${attr.value.attribute.slug}_${attr.value.value}`;
				attributesMap.set(uniqueKey, {
					key: attr.value.attribute.slug,
					name: attr.value.attribute.name,
					value: attr.value.value
				});
			});
		});

		let mainImage = '';

		if (product.productImages && product.productImages.length > 0) {
			mainImage = product.productImages[0].url;
		} else if (product.variants.length > 0 && product.variants[0].productImages.length > 0) {
			mainImage = product.variants[0].productImages[0].url;
		}

		const document = {
			id: product.id,
			title: product.title,
			slug: product.slug,
			description: product.description,
			category_id: product.categoryId,
			category_name: product.category.name,
			category_slug: product.category.slug,
			price_min: minPrice,
			price_max: maxPrice,
			total_stock: totalStock,
			image: mainImage,
			created_at: product.createdAt,
			attributes: Array.from(attributesMap.values())
		};

		return this.client.index({
			index: this.indexName,
			id: product.id,
			body: document
		});
	}

	async removeProduct(productId: string): Promise<boolean> {
		try {
			await this.client.delete({
				index: this.indexName,
				id: productId
			});
			return true;
		} catch {
			return false;
		}
	}

	async searchProducts(input: GetProductsInput): Promise<{ ids: string[]; total: number }> {
		const { search, categoryId, minPrice, maxPrice, attributes, offset, limit } = input;

		const mustConditions: QueryDsl[] = [];
		const filterConditions: QueryDsl[] = [];

		if (search) {
			mustConditions.push({
				multi_match: {
					query: search,
					fields: ['title^3', 'description'],
					fuzziness: 'AUTO'
				}
			});
		} else {
			mustConditions.push({ match_all: {} });
		}

		if (categoryId) {
			filterConditions.push({ term: { category_id: categoryId } });
		}

		if (minPrice !== undefined || maxPrice !== undefined) {
			const range: Record<string, number> = {};
			if (minPrice !== undefined) range.gte = minPrice;
			if (maxPrice !== undefined) range.lte = maxPrice;

			filterConditions.push({ range: { price_min: range } });
		}

		if (attributes && attributes.length > 0) {
			attributes.forEach(attr => {
				filterConditions.push({
					nested: {
						path: 'attributes',
						query: {
							bool: {
								must: [
									{ term: { 'attributes.key': attr.slug } },
									{ terms: { 'attributes.value': attr.values } }
								]
							}
						}
					}
				});
			});
		}

		const result = await this.client.search({
			index: this.indexName,
			body: {
				from: offset,
				size: limit,
				query: {
					bool: {
						must: mustConditions,
						filter: filterConditions
					}
				},
				_source: false
			}
		});

		// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
		const response = result as TypedApiResponse<ProductSearchBody>;

		const ids = response.body.hits.hits.map(hit => hit._id);
		const total = response.body.hits.total.value;

		return { ids, total };
	}
}
