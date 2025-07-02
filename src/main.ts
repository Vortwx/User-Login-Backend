import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: 'http://localhost:3005',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle('User Login Page API')
        .setDescription(
            'API documentation for user creation and authentication.',
        )
        .setVersion('1.0')
        .addSecurity('cookieAuth', {
            type: 'apiKey',
            in: 'cookie',
            name: 'sessionToken',
            description: 'Authentication cookie for session management.',
        })
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-documentation', app, document);

    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
