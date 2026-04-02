import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class SearchSuggestion {
	@Field()
	title: string;

	@Field()
	slug: string;

	@Field()
	categorySlug: string;

	@Field()
	categoryName: string;
}
