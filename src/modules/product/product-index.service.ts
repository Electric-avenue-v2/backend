import { Injectable, OnModuleInit } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { PRODUCT_INDEX_NAME } from './constants/product.constants';
import { EsProductDocument } from './types/es-product.types';

@Injectable()
export class ProductIndexService implements OnModuleInit {
	constructor(private readonly elasticsearchService: ElasticsearchService) {}

	async onModuleInit(): Promise<void> {
		const indexExists = await this.elasticsearchService.indices.exists({
			index: PRODUCT_INDEX_NAME
		});

		if (!indexExists) {
			await this.elasticsearchService.indices.create({
				index: PRODUCT_INDEX_NAME,
				mappings: {
					properties: {
						id: { type: 'keyword' },
						title: { type: 'text', analyzer: 'standard', fields: { keyword: { type: 'keyword' } } },
						slug: { type: 'keyword' },
						description: { type: 'text', analyzer: 'standard' },

						categoryId: { type: 'keyword' },
						categoryName: { type: 'text', fields: { keyword: { type: 'keyword' } } },
						categorySlug: { type: 'keyword' },

						sellerId: { type: 'keyword' },

						minPrice: { type: 'double' },
						maxPrice: { type: 'double' },
						totalStock: { type: 'integer' },
						inStock: { type: 'boolean' },

						thumbnailUrl: { type: 'keyword', index: false },

						createdAt: { type: 'date' },
						updatedAt: { type: 'date' },

						specs: {
							type: 'nested',
							properties: {
								slug: { type: 'keyword' },
								name: { type: 'keyword' },
								value: { type: 'keyword' },
								numericValue: { type: 'double' }
							}
						},

						variants: {
							type: 'nested',
							properties: {
								id: { type: 'keyword' },
								sku: { type: 'keyword' },
								price: { type: 'double' },
								stock: { type: 'integer' },
								imageUrl: { type: 'keyword', index: false },
								attributes: {
									type: 'nested',
									properties: {
										slug: { type: 'keyword' },
										name: { type: 'keyword' },
										value: { type: 'keyword' },
										numericValue: { type: 'double' }
									}
								}
							}
						}
					}
				}
			});
		}
	}

	async indexProduct(productDoc: EsProductDocument): Promise<void> {
		await this.elasticsearchService.index({
			index: PRODUCT_INDEX_NAME,
			id: productDoc.id,
			document: productDoc
		});
	}

	async searchProducts(searchTerm: string): Promise<EsProductDocument[]> {
		const result = await this.elasticsearchService.search<EsProductDocument>({
			index: PRODUCT_INDEX_NAME,
			query: {
				multi_match: {
					query: searchTerm,
					fields: ['title^3', 'description', 'variants.sku']
				}
			}
		});

		const products: EsProductDocument[] = [];

		for (const hit of result.hits.hits) {
			if (hit._source !== undefined) {
				products.push(hit._source);
			}
		}

		return products;
	}

	async deleteProduct(id: string): Promise<void> {
		try {
			await this.elasticsearchService.delete({
				index: PRODUCT_INDEX_NAME,
				id,
			});
		} catch (err) {
			if (err instanceof Error && err.message.includes('not_found')) return;
			throw err;
		}
	}
}
