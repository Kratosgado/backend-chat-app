import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';
import { RedisIoAdapter } from './chats/redis.adapter';

async function bootstrap() {

  const logger = new Logger('bootstrap');

  const app = await NestFactory.create(AppModule);
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);
  app.useGlobalPipes(new ValidationPipe)
  app.enableCors()
  app.get(PrismaService);
  app.enableShutdownHooks()

  await app.listen(4000);

  logger.log(`Application listening on port: 4000`)
}
bootstrap();
