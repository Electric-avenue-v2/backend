import { Field, InputType } from '@nestjs/graphql';
import { IsString, MinLength } from 'class-validator';

@InputType()
export class SearchSuggestionsInput {
	@Field()
	@IsString()
	@MinLength(2)
	query: string;
}
