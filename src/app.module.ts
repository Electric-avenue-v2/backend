import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { MailgunModule } from './mailgun/mailgun.module';
import { HashingModule } from './hashing/hashing.module';
import { JwtTokenModule } from './jwt-token/jwt-token.module';
import { CookiesModule } from './cookies/cookies.module';
import { APP_GUARD } from '@nestjs/core';
import { AtGuard } from '~/common/guards/at.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CategoryModule,
    PrismaModule,
    ProductModule,
    AuthModule,
    MailgunModule,
    HashingModule,
    JwtTokenModule,
    CookiesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
  ],
})

export class AppModule {
}
