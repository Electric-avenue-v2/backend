import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SearchSuggestion {
	@Field(() => ID)
	id: string;

	@Field()
	title: string;

	@Field()
	slug: string;

	@Field()
	categorySlug: string;

	@Field()
	categoryName: string;
}
