import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { UserController } from './user/user.controller';
import { PrismaService } from './prisma.service';
import { ChatModule } from './chat/chat.module';
import { ChatGateway } from './websocket.gateway';

@Module({
  providers: [PrismaService, ChatGateway],
  // controllers: [UserController],
  imports: [UserModule, ChatModule],
})
export class AppModule { }
