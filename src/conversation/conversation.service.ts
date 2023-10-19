import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Conversation, CreateChatInput } from './conversation-utils.input';
import { Prisma, Conversation as ConversationModel } from '@prisma/client';

@Injectable()
export class ConversationService {
   constructor(private readonly prisma: PrismaService) { }
   
   async createChat(createChatInput: CreateChatInput): Promise<ConversationModel> {
      const { convoName, users } = createChatInput;
      const foundUsers = users.map(id => await this.prisma.user.findUnique({
         where: { id }
      }));

      const createdChat = await this.prisma.conversation.create({
         data: {
            convoName,
            users: 
         }
      })
      return createdChat
   }
}
