import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ArcjetMiddleware } from './common/middleware/arcjet.middleware.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(new ArcjetMiddleware().use.bind(new ArcjetMiddleware()));
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();