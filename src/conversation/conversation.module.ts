import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationResolver } from './conversation.resolver';
import { PrismaService } from 'src/prisma.service';
import { MessageResolver } from 'src/message/message.resolver';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { MessageService } from 'src/message/message.service';

@Module({
  providers: [
    ConversationResolver, ConversationService,
    UserService, JwtService,
    MessageResolver,  MessageService,
    PrismaService],
})
export class ConversationModule {}
