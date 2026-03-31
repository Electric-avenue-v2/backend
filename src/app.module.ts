import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { redisStore } from 'cache-manager-ioredis-yet';
import { Request, Response } from 'express';
import { join } from 'path';
import { AtGuard, RoleGuard } from '~/common/guards';
import { HashingModule } from '~/infrastructure/hashing/hashing.module';
import { MailgunModule } from '~/infrastructure/mailgun/mailgun.module';
import { PrismaModule } from '~/infrastructure/prisma/prisma.module';
import { AuthModule } from '~/modules/auth/auth.module';
import { CategoryModule } from '~/modules/category/category.module';
import { ProductModule } from '~/modules/product/product.module';
import { UserModule } from '~/modules/user/user.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { SearchModule } from './search/search.module';

@Module({
	imports: [
		GraphQLModule.forRoot<ApolloDriverConfig>({
			driver: ApolloDriver,
			autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
			context: ({ req, res }: { req: Request; res: Response }) => ({ req, res })
		}),
		ConfigModule.forRoot({ isGlobal: true }),
		BullModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				connection: {
					host: configService.getOrThrow('REDIS_HOST'),
					port: 6379,
					password: configService.getOrThrow('REDIS_PASSWORD')
				}
			}),
			inject: [ConfigService]
		}),
		CacheModule.registerAsync({
			isGlobal: true,
			imports: [ConfigModule],
			useFactory: async (configService: ConfigService) => ({
				store: await redisStore({
					host: configService.getOrThrow<string>('REDIS_HOST'),
					port: 6379,
					password: configService.getOrThrow<string>('REDIS_PASSWORD')
				}),
				ttl: 60 * 60 * 6 // 6h
			}),
			inject: [ConfigService]
		}),
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
