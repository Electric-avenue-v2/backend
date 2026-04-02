import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { AtGuard, RoleGuard } from '~/common/guards';
import { ElasticSearchModule } from '~/infrastructure/elastic-search/elastic-search.module';
import { GraphqlConfigModule } from '~/infrastructure/graphql/graphql-config.module';
import { HashingModule } from '~/infrastructure/hashing/hashing.module';
import { MailgunModule } from '~/infrastructure/mailgun/mailgun.module';
import { PrismaModule } from '~/infrastructure/prisma/prisma.module';
import { RedisConfigModule } from '~/infrastructure/redis/redis-config.module';
import { AuthModule } from '~/modules/auth/auth.module';
import { CategoryModule } from '~/modules/category/category.module';
import { ProductModule } from '~/modules/product/product.module';
import { UserModule } from '~/modules/user/user.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { SearchModule } from './modules/search/search.module';

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
		SearchModule
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
