import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { PrismaClientExceptionFilter } from '~/common/filters';
import { AtGuard, RoleGuard } from '~/common/guards';
import { ElasticSearchModule } from '~/infrastructure/elastic-search';
import { GraphqlConfigModule } from '~/infrastructure/graphql';
import { HashingModule } from '~/infrastructure/hashing';
import { MailgunModule } from '~/infrastructure/mailgun';
import { PrismaModule } from '~/infrastructure/prisma';
import { RedisConfigModule } from '~/infrastructure/redis';
import { AuthModule } from '~/modules/auth';
import { CategoryModule } from '~/modules/category';
import { FavoriteModule } from '~/modules/favorite';
import { ProductModule } from '~/modules/product';
import { UserModule } from '~/modules/user';
import { AnalyticsModule } from './modules/analytics';
import { SearchModule } from '~/modules/search';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
		GraphqlConfigModule,
		RedisConfigModule,
		ElasticSearchModule,
		CategoryModule,
		PrismaModule,
		ProductModule,
		AuthModule,
		MailgunModule,
		HashingModule,
		UserModule,
		SearchModule,
		AnalyticsModule,
		FavoriteModule
	],
	providers: [
		{
			provide: APP_GUARD,
			useClass: AtGuard
		},
		{
			provide: APP_GUARD,
			useClass: RoleGuard
		},
		{
			provide: APP_FILTER,
			useClass: PrismaClientExceptionFilter
		}
	]
})
export class AppModule {}
