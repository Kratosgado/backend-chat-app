import { Module } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { ChatsGateway } from './chats.gateway';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';
import { MessageService } from './message.service';
import { SocketService } from './socket.service';

@Module({
  providers: [ChatsGateway, ChatsService, PrismaService, UserService, MessageService, SocketService],
})
export class ChatsModule { }
