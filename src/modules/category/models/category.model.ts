import { Field, ID, ObjectType } from '@nestjs/graphql';




@ObjectType()
export class Category {
	@Field(() => ID)
	id: string;

	@Field()
	name: string;

	@Field()
	slug: string;

	@Field(() => String, { nullable: true })
	icon: string | null;

	@Field(() => String, { nullable: true })
	parentId: string | null;
}

@ObjectType()
export class CategorySitemapInfo {
	@Field()
	slug: string;

	@Field(() => Date)
	lastModified: Date;
}