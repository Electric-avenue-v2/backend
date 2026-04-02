import { BullModule } from '@nestjs/bullmq';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { redisStore } from 'cache-manager-ioredis-yet';

@Module({
	imports: [
		BullModule.forRootAsync({
			imports: [ConfigModule],
			useFactory: (configService: ConfigService) => ({
				connection: {
					host: configService.getOrThrow<string>('REDIS_HOST'),
					port: Number(configService.getOrThrow<string>('REDIS_PORT')),
					password: configService.getOrThrow<string>('REDIS_PASSWORD')
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
					port: Number(configService.getOrThrow<string>('REDIS_PORT')),
					password: configService.getOrThrow<string>('REDIS_PASSWORD')
				}),
				ttl: 60 * 60 * 6 // 6h
			}),
			inject: [ConfigService]
		})
	]
})
export class RedisConfigModule {}
