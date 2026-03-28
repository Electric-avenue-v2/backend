import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
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
		origin: process.env.CLIENT_URL,
		methods: 'GET,POST,PUT,DELETE',
		credentials: true
	});

	const config = new DocumentBuilder()
		.setTitle('Electric Avenue API')
		.setDescription('This is an API for interacting with application.')
		.setVersion('1.0.0')
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup('/api/docs', app, document);

	await app.listen(process.env.PORT ?? 8000);
};

void bootstrap();
