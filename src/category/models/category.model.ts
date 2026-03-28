import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Category {
	@Field(() => ID)
	id: string;

	@Field()
	name: string;

	@Field(() => String, { nullable: true })
	parentId: string | null;

	@Field(() => String, { nullable: true })
	icon: string | null;
}
