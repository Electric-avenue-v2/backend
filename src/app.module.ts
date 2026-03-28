import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { join } from 'path';
import { AppResolver } from '~/app.resolver';
import { AtGuard } from '~/common/guards/at.guard';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { PrismaClientExceptionFilter } from './common/filters/prisma-client-exception.filter';
import { HashingModule } from './hashing/hashing.module';
import { MailgunModule } from './mailgun/mailgun.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductModule } from './product/product.module';
import { SearchModule } from './search/search.module';
import { UserModule } from './user/user.module';

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
		AppResolver,
		{
			provide: APP_GUARD,
			useClass: AtGuard
		},
		{
			provide: APP_FILTER,
			useClass: PrismaClientExceptionFilter
		}
	]
})
export class AppModule {}
