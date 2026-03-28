import { Query, Resolver } from '@nestjs/graphql';
import { Public } from '~/common/decorators';
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
}
