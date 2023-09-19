import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as config from 'config';

import { AppModule } from './app.module';

async function bootstrap() {
  const serverConfig = config.get('server');
  const port = process.env.PORT || serverConfig.port;
  
  const logger = new Logger('bootstrap');

  const app = await NestFactory.create(AppModule);
  app.enableCors()
  
  await app.listen(port);
  
  logger.log(`Application listening on port: ${port}`)
}
bootstrap();
