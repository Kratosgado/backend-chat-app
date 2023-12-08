import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { PrismaService } from './prisma.service';
import { ChatModule } from './chat/chat.module';
import { ChatGateway } from './websocket.gateway';
import { AuthModule } from './auth/auth.module';

@Module({
  providers: [PrismaService, ChatGateway],
  // controllers: [UserController],
  imports: [UserModule, ChatModule, AuthModule],
})
export class AppModule { }
