import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { PrismaService } from 'src/prisma.service';
import { ChatService } from './chat.service';
import { MessageService } from 'src/message/message.service';
import { MessageController } from 'src/message/message.controller';

@Module({
  controllers: [ChatController, MessageController],
  providers: [ChatService, PrismaService, MessageService],
})
export class ChatModule { }
