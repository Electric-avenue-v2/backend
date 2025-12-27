import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { IRequestWithCookies } from '~/auth/types/auth.types';
import { JwtPayload } from '~/jwt-token/types/jwt-token.types';

@Injectable()
export class RtStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(config: ConfigService) {
    const rtSecret = config.getOrThrow<string>('RT_SECRET');

    super({
      jwtFromRequest: RtStrategy.extractJwt,
      secretOrKey: rtSecret,
      passReqToCallback: true,
    });
  }

  private static extractJwt(
    this: void,
    req: IRequestWithCookies,
  ): string | null {
    const cookieToken = req.cookies?.refreshToken;
    if (cookieToken) {
      return cookieToken;
    }

    const headerToken = req.headers['x-refresh-token'];
    if (typeof headerToken === 'string') {
      return headerToken;
    }

    throw new ForbiddenException('Refresh token not found');
  }

  validate(req: IRequestWithCookies, payload: JwtPayload): JwtPayload & { refreshToken: string | null } {
    const refreshToken = RtStrategy.extractJwt(req);

    return {
      sub: payload.sub,
      email: payload.email,
      refreshToken,
    };
  }
}