import { Args, Float, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { GetCurrentUserId, Public } from '~/common/decorators';
import { CreateProductInput } from '~/product/dto/create-product.input';
import { GetProductsInput } from '~/product/dto/get-products.input';
import { ProductFull, ProductList, ProductPayload } from '~/product/types/product.types';
import { ProductBase, ProductDetails, ProductPagination } from './models/product.model';
import { ProductService } from './product.service';




























@Resolver(() => ProductBase)
export class ProductResolver {
	constructor(private readonly productService: ProductService) {}

	@Public()
	@Query(() => ProductPagination, { name: 'products' })
	async getProducts(
		@Args('query', { type: () => GetProductsInput }) query: GetProductsInput
	): Promise<{ items: ProductList[]; total: number }> {
		return this.productService.getAll(query);
	}

	@Public()
	@Query(() => ProductDetails, { name: 'product' })
	async getProduct(@Args('id') id: string): Promise<ProductFull> {
		return this.productService.getById(id);
	}

	@Mutation(() => ProductDetails)
	async createProduct(
		@Args('createProductInput') createProductInput: CreateProductInput,
		@GetCurrentUserId() userId: string
	): Promise<ProductFull> {
		return this.productService.create(userId, createProductInput);
	}

	@Mutation(() => ProductDetails)
	async deleteProduct(
		@Args('id') id: string,
		@GetCurrentUserId() userId: string
	): Promise<ProductFull> {
		return this.productService.delete(id, userId);
	}

	@ResolveField(() => Float, { nullable: true })
	minPrice(@Parent() product: ProductPayload): number | null {
		if (!product.variants || product.variants.length === 0) return null;

		const prices = product.variants.map(v => Number(v.price));
		return Math.min(...prices);
	}

	@ResolveField(() => String, { nullable: true })
	thumbnail(@Parent() product: ProductPayload): string | null {
		if (product.productImages && product.productImages.length > 0) {
			return product.productImages[0].url;
		}
		if (
			product.variants &&
			product.variants.length > 0 &&
			product.variants[0].productImages &&
			product.variants[0].productImages.length > 0
		) {
			return product.variants[0].productImages[0].url;
		}
		return null;
	}

	@ResolveField(() => Int)
	variantsCount(@Parent() product: ProductPayload): number {
		return product.variants?.length ?? 0;
	}
}
