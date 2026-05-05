import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class PaginationMeta {
	@Field(() => Int)
	currentPage: number;

	@Field(() => Int)
	totalPages: number;

	@Field(() => Int)
	totalItems: number;

	@Field(() => Int)
	itemsPerPage: number;

	@Field()
	hasNextPage: boolean;

	@Field()
	hasPrevPage: boolean;
}
