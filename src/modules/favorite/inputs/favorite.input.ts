import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import {
	ArrayMaxSize,
	IsArray,
	IsNumber,
	IsString,
	Max,
	Min,
	ValidateNested
} from 'class-validator';






@InputType()
export class SyncFavoritesInput {
	@Field(() => [String])
	@IsArray()
	@IsString({ each: true })
	productIds: string[];
}

@InputType()
export class FavoriteProductsInput {
	@Max(200)
	@Field(() => Int, { defaultValue: 1 })
	@IsNumber()
	@Min(1)
	page = 1;

	@Max(48)
	@Field(() => Int, { defaultValue: 24 })
	@IsNumber()
	@Min(1)
	limit = 24;
}

@InputType()
class GuestFavoriteItemInput {
	@Field()
	productId: string;

	@Field(() => Float)
	addedAt: number;
}

@InputType()
export class GuestFavoriteProductsInput extends FavoriteProductsInput {
	@Field(() => [GuestFavoriteItemInput])
	@IsArray()
	@ArrayMaxSize(200)
	@ValidateNested({ each: true })
	@Type(() => GuestFavoriteItemInput)
	productIds: GuestFavoriteItemInput[];
}
