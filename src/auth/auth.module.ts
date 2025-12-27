import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailgunModule } from '~/mailgun/mailgun.module';
import { HashingModule } from '~/hashing/hashing.module';
import { JwtTokenModule } from '~/jwt-token/jwt-token.module';
import { AtStrategy, RtStrategy } from '~/auth/strategies';
import { CookiesModule } from '~/cookies/cookies.module';

@Module({
  imports: [MailgunModule, HashingModule, JwtTokenModule, CookiesModule],
  controllers: [AuthController],
  providers: [AuthService, AtStrategy, RtStrategy],
})
export class AuthModule {
}
