import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { constants } from '~/auth/constants/jwt-token.constants';
import { JwtPayload, Tokens } from './types/jwt-token.types';

@Injectable()
export class JwtTokenService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService
	) {}

	async signTokens(payload: JwtPayload): Promise<Tokens> {
		const [accessToken, refreshToken] = await Promise.all([
			this.jwtService.signAsync(payload, {
				secret: this.configService.get<string>('AT_SECRET'),
				expiresIn: `${constants.EXPIRE_MINUTES_ACCESS_TOKEN}m`
			}),
			this.jwtService.signAsync(payload, {
				secret: this.configService.get<string>('RT_SECRET'),
				expiresIn: `${constants.EXPIRE_DAY_REFRESH_TOKEN}d`
			})
		]);

		return { accessToken, refreshToken };
	}
}
