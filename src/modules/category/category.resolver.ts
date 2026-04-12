import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { Public, Roles } from '~/common/decorators';
import { CategoryService } from './category.service';
import { Category } from './models/category.model';







@Resolver(() => Category)
export class CategoryResolver {
	constructor(private readonly categoryService: CategoryService) {}

	@Public()
	@Query(() => [Category], { name: 'categories' })
	async getAll(): Promise<Category[]> {
		return this.categoryService.getAll();
	}

	@Roles('ADMIN')
	@Mutation(() => Boolean)
	async invalidateCategoriesCache(): Promise<boolean> {
		return this.categoryService.invalidateCache();
	}

	@Public()
	@Query(() => Category, { name: 'categoryBySlug', nullable: true })
	async getBySlug(
		@Args('slug') slug: string
	): Promise<Category | null> {
		return this.categoryService.getBySlug(slug);
	}
}
