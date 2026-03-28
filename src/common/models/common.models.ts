import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class MessageResponse {
	@Field()
	message: string;
}

@ObjectType()
export class SuccessResponse {
	@Field()
	success: boolean;
}

@ObjectType()
export class UserIdResponse {
	@Field()
	userId: string;
}
