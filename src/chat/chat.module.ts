import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { PrismaService } from 'src/prisma.service';
import { ChatService } from './chat.service';
import { ChatGateway } from 'src/websocket.gateway';

@Module({
  controllers: [ChatController],
  providers: [ChatService, PrismaService, ChatGateway],
})
export class ChatModule { }
