import { Module } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { ConversationResolver } from './conversation.resolver';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [ConversationResolver, ConversationService, PrismaService],
})
export class ConversationModule {}
