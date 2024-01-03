import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { PrismaService } from 'src/prisma.service';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { UserService } from 'src/user/user.service';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [ChatController],
  providers: [ChatService, PrismaService, ChatGateway, UserService],
})
export class ChatModule { }
