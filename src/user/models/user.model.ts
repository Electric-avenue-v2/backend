import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserModel {
	@Field(() => ID)
	id: string;

	@Field()
	email: string;

	@Field()
	firstName: string;

	@Field()
	lastName: string;

	@Field()
	confirmed: boolean;

	@Field(() => GraphQLISODateTime)
	createdAt: Date;

	@Field(() => GraphQLISODateTime)
	updatedAt: Date;
}
