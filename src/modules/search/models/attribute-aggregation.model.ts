import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class AttributeValueAggregation {
	@Field()
	value: string;

	@Field(() => Int)
	count: number;
}

@ObjectType()
export class AttributeAggregation {
	@Field()
	slug: string;

	@Field()
	name: string;

	@Field(() => [AttributeValueAggregation])
	values: AttributeValueAggregation[];
}

@ObjectType()
export class PriceRangeAggregation {
	@Field()
	min: number;

	@Field()
	max: number;
}

@ObjectType()
export class SearchAggregations {
	@Field(() => [AttributeAggregation])
	attributes: AttributeAggregation[];

	@Field(() => PriceRangeAggregation, { nullable: true })
	priceRange: PriceRangeAggregation | null;
}
