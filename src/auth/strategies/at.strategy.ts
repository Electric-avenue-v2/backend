import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { IRequestWithCookies } from '~/auth/types/auth.types';
import { JwtPayload } from '~/jwt-token/types/jwt-token.types';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService) {
    const atSecret = config.getOrThrow<string>('AT_SECRET');

    super({
      jwtFromRequest: AtStrategy.extractJwt,
      secretOrKey: atSecret,
      passReqToCallback: true,
    });
  }

  private static extractJwt(
    this: void,
    req: IRequestWithCookies,
  ): string | null {
    const cookieToken = req.cookies?.accessToken;
    if (cookieToken) {
      return cookieToken;
    }

    const bearerToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (bearerToken) {
      return bearerToken;
    }

    throw new ForbiddenException('Access token not found');
  }

  validate(req: IRequestWithCookies, payload: JwtPayload): JwtPayload & {accessToken: string | null} {
    const accessToken = AtStrategy.extractJwt(req);

    return {
      sub: payload.sub,
      email: payload.email,
      accessToken,
    };
  }
}