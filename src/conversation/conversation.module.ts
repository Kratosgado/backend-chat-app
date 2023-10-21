import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationResolver } from './conversation.resolver';
import { PrismaService } from 'src/prisma.service';
import { MessageResolver } from 'src/message/message.resolver';

@Module({
  providers: [ConversationResolver,MessageResolver, ConversationService, PrismaService],
})
export class ConversationModule {}
