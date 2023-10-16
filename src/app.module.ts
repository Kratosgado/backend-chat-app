import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserService } from './user.service';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService, UserService],
  controllers: [AppController],
})
export class AppModule {}
