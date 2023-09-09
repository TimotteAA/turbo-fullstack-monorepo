import { NestFactory } from '@nestjs/core';
import { useContainer } from 'class-validator';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        cors: true,
    });
    app.setGlobalPrefix('api');
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    await app.listen(3100);
}
bootstrap();
