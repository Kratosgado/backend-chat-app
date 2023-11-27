import { NestFactory } from '@nestjs/core';
import { Logger, Session, ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';
import { graphqlUploadExpress } from 'graphql-upload';
import * as csurf from "csurf";
import * as cookieParser from 'cookie-parser';
import * as session from 'express-session';

async function bootstrap() {

  const logger = new Logger('bootstrap');

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe)
  app.enableCors()
  app.use(graphqlUploadExpress({ maxFileSize: 2 * 1000 * 1000 }));
  app.get(PrismaService);
  app.enableShutdownHooks();
  app.use(cookieParser());
  app.use(
    session({
      name: 'demo-session',
      secret: 'token',
      resave: true,
      saveUninitialized: true
    })
  );

  app.use(csurf({ session: 'demo-session' }));
  await app.listen(4000);

  logger.log(`Application listening on port: 4000`)
}
bootstrap();
