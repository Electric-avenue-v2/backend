import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

const bootstrap = async (): Promise<void> => {
	const app = await NestFactory.create(AppModule);
	app.use(cookieParser());
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true
		})
	);

	app.enableCors({
		origin: [process.env.CLIENT_URL, process.env.CLIENT_URL2].filter(Boolean),
		methods: 'GET,POST,PUT,DELETE,OPTIONS',
		credentials: true
	});

	await app.listen(process.env.PORT ?? 8000);
};

void bootstrap();
