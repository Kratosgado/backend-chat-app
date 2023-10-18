import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

@Module({
  providers: [PrismaService, UserService],
  controllers: [UserController],
  imports: [UserModule],
})
export class AppModule {}
