import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { HashingModule } from '~/infrastructure/hashing';
import { MailgunModule } from '~/infrastructure/mailgun';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';
import { CookiesService } from './cookies.service';
import { JwtTokenService } from './jwt-token.service';
import { AtStrategy } from './strategies/at.strategy';
import { RtStrategy } from './strategies/rt.strategy';

@Module({
	imports: [JwtModule.register({}), MailgunModule, HashingModule],
	providers: [AuthService, AuthResolver, CookiesService, JwtTokenService, AtStrategy, RtStrategy]
})
export class AuthModule {}
