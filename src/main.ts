import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';

import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  
  const logger = new Logger('bootstrap');

  const app = await NestFactory.create(AppModule);
  app.enableCors()
  app.get(PrismaService);
  // await prismaService.enableShutdownHooks(app);
  await app.listen(3000);
  
  logger.log(`Application listening on port: 3000`)
}
bootstrap();
