import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { CookiesService } from '~/auth/cookies.service';
import { JwtTokenService } from '~/auth/jwt-token.service';
import { AtStrategy, RtStrategy } from '~/auth/strategies';
import { HashingModule } from '~/hashing/hashing.module';
import { MailgunModule } from '~/mailgun/mailgun.module';
import { AuthService } from './auth.service';
import { AuthResolver } from '~/auth/auth.resolver';

@Module({
	imports: [JwtModule.register({}), MailgunModule, HashingModule],
	providers: [
		AuthService,
		AuthResolver,
		CookiesService,
		JwtTokenService,
		AtStrategy,
		RtStrategy
	]
})
export class AuthModule {}
