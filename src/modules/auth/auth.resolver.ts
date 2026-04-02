import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Response } from 'express';
import { GetCurrentUser, GetCurrentUserId, Public } from '~/common/decorators';
import { RtGuard } from '~/common/guards';
import { MessageResponse, UserIdResponse } from '~/common/models';
import { AuthService } from './auth.service';
import { CookiesService } from './cookies.service';
import { LoginInput, RegisterInput } from './inputs/auth.input';
import { ResendOtpInput, VerifyOtpInput } from './inputs/otp.input';
import { Tokens } from './models/auth.models';
import { type IRequestWithCookies } from './types/auth.types';
import { JwtPayloadWithRt } from './types/jwt-token.types';

interface GqlContext {
	req: IRequestWithCookies;
	res: Response;
}

@Resolver()
export class AuthResolver {
	constructor(
		private readonly authService: AuthService,
		private readonly cookiesService: CookiesService
	) {}

	@Public()
	@Mutation(() => UserIdResponse)
	async register(@Args('input') input: RegisterInput): Promise<UserIdResponse> {
		return this.authService.register(input);
	}

	@Public()
	@Mutation(() => Tokens)
	async login(@Args('input') input: LoginInput, @Context() context: GqlContext): Promise<Tokens> {
		const tokens = await this.authService.login(input);
		this.cookiesService.addTokensToCookies(context.res, tokens);
		return tokens;
	}

	@Mutation(() => MessageResponse)
	async logout(@GetCurrentUserId() userId: string, @Context() context: GqlContext): Promise<MessageResponse> {
		const result = await this.authService.logout(userId);
		this.cookiesService.removeTokensFromResponse(context.res);
		return result;
	}

	@Public()
	@UseGuards(RtGuard)
	@Mutation(() => Tokens)
	async refresh(
		@GetCurrentUserId() userId: string,
		@GetCurrentUser() user: JwtPayloadWithRt,
		@Context()
		context: GqlContext
	): Promise<Tokens> {
		const tokens = await this.authService.refreshTokens(userId, user.refreshToken);

		this.cookiesService.addTokensToCookies(context.res, tokens);
		return tokens;
	}

	@Public()
	@Mutation(() => MessageResponse)
	async verifyOtp(@Args('input') input: VerifyOtpInput): Promise<MessageResponse> {
		return this.authService.verifyOtp(input);
	}

	@Public()
	@Mutation(() => MessageResponse)
	async resendOtp(@Args('input') input: ResendOtpInput): Promise<MessageResponse> {
		return this.authService.resendOtp(input);
	}
}
