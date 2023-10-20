import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Conversation, CreateChatInput } from './conversation-utils.input';
import { Prisma, Conversation as ConversationModel, User } from '@prisma/client';

@Injectable()
export class ConversationService {
   constructor(private readonly prisma: PrismaService) { }
   
   async createChat(createChatInput: CreateChatInput, currentUser: User): Promise<ConversationModel> {
      const { convoName, users } = createChatInput;
      users.filter(id => id !== currentUser.id);
      const foundUsers = await this.prisma.user.findMany({
         where: {
            id: {
               in: users
            }
         }
      });

      const createdChat = await this.prisma.conversation.create({
         data: {
            convoName,
            users: {
               connect:[currentUser, ...foundUsers]
            }
         }
      })
      return createdChat
   }

   async chat({id}: Prisma.ConversationWhereUniqueInput, currentUser: User): Promise<ConversationModel> {
      return await this.prisma.conversation.findUnique({
         where: {
            id: id,
            users: {
               some: currentUser
            }
         },
         include: {
            users: true
         }
      })
   }

   async chats(currentUser: User): Promise<ConversationModel[]>{
      return await this.prisma.conversation.findMany({
         where: {
            users: {
               some: currentUser
            }
         },
         include: {
            users: true
         }
      })
   }
}
