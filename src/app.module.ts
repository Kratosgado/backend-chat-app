import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { UserService } from './user.service';
import { PrismaService } from './prisma.service';
import { UserModule } from './user/user.module';

@Module({
  providers: [PrismaService, UserService],
  controllers: [AppController],
  imports: [UserModule],
})
export class AppModule {}
