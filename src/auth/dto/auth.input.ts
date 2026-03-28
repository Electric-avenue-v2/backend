import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

@InputType()
export class RegisterInput {
	@Field()
	@IsEmail()
	email: string;

	@Field()
	@IsString()
	@Length(6, 100)
	password: string;

	@Field()
	@IsString()
	@Length(2, 100)
	firstName: string;

	@Field()
	@IsString()
	@Length(2, 100)
	lastName: string;
}

@InputType()
export class LoginInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	email: string;

	@Field()
	@IsString()
	@IsNotEmpty()
	password: string;
}
