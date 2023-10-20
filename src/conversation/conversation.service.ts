import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Conversation, CreateChatInput } from './conversation-utils.input';
import { Prisma, Conversation as ConversationModel } from '@prisma/client';

@Injectable()
export class ConversationService {
   constructor(private readonly prisma: PrismaService) { }
   
   async createChat(createChatInput: CreateChatInput): Promise<ConversationModel> {
      const { convoName, users } = createChatInput;
      const foundUsers = await this.prisma.user.findMany({
         where: {
            id: {
               in: users
            }
         }
      })

      const createdChat = await this.prisma.conversation.create({
         data: {
            convoName,
            users: {
               connect: foundUsers
            }
         }
      })
      return createdChat
   }

   async chat(unique: Prisma.ConversationWhereUniqueInput): Promise<ConversationModel> {
      return await this.prisma.conversation.findUnique({
         where: unique,
         include: {
            users: true
         }
      })
   }
}
