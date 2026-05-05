import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { GetCurrentUserId, Public } from '~/common/decorators';
import { CreateProductInput } from './inputs/create-product.input';
import { ProductBase, ProductDetails, ProductSeo } from './models/product.model';
import { ProductService } from './product.service';
import { ProductFull } from './types/product.types';

@Resolver(() => ProductBase)
export class ProductResolver {
	constructor(private readonly productService: ProductService) {}

	@Public()
	@Query(() => ProductDetails, { name: 'product' })
	async getProduct(@Args('id') id: string): Promise<ProductDetails> {
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

	@Public()
	@Query(() => ProductSeo, { name: 'productSeo' })
	async getProductSeo(@Args('id') id: string): Promise<ProductSeo> {
		return this.productService.getSeoById(id);
	}
}
