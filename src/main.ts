import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initializeFirebaseApp } from './config/firebase.config';

initializeFirebaseApp();
async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // On authorise le CORS
    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        preflightContinue: false,
        allowedHeaders: ['Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'],
        exposedHeaders: ['Content-Disposition'],
    });
    await app.listen(process.env.PORT);
}
bootstrap();
