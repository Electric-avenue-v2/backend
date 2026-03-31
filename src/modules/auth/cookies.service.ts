import { Injectable } from '@nestjs/common';
import { CookieOptions, Response } from 'express';
import { JWT_CONSTANTS } from './constants/jwt-token.constants';
import { Tokens } from './types/jwt-token.types';

@Injectable()
export class CookiesService {
	private getCookieOptions(): CookieOptions {
		return {
			httpOnly: true,
			sameSite: 'lax' as const,
			secure: process.env.NODE_ENV === 'prod',
			...(process.env.NODE_ENV === 'prod' && {
				domain: '.electric-avenue.online'
			})
		};
	}

	addTokensToCookies(res: Response, tokens: Tokens): void {
		res.cookie(JWT_CONSTANTS.ACCESS_TOKEN_NAME, tokens.accessToken, {
			...this.getCookieOptions(),
			maxAge: JWT_CONSTANTS.EXPIRE_MINUTES_ACCESS_TOKEN * 60 * 1000
		});

		res.cookie(JWT_CONSTANTS.REFRESH_TOKEN_NAME, tokens.refreshToken, {
			...this.getCookieOptions(),
			maxAge: JWT_CONSTANTS.EXPIRE_DAY_REFRESH_TOKEN * 24 * 60 * 60 * 1000
		});
	}

	removeTokensFromResponse(res: Response): void {
		res.clearCookie(JWT_CONSTANTS.REFRESH_TOKEN_NAME, this.getCookieOptions());
		res.clearCookie(JWT_CONSTANTS.ACCESS_TOKEN_NAME, this.getCookieOptions());
	}
}
