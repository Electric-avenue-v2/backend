import { Field, InputType } from '@nestjs/graphql';
import { IsArray, IsString } from 'class-validator';

@InputType()
export class SyncFavoritesInput {
	@Field(() => [String])
	@IsArray()
	@IsString({ each: true })
	productIds: string[];
}
