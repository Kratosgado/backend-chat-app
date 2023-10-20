import { Injectable, Logger, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Conversation, CreateChatInput } from './conversation-utils.input';
import { Prisma, Conversation as ConversationModel, User } from '@prisma/client';

@Injectable()
export class ConversationService {
   private logger = new Logger("ConversationService");

   constructor(private readonly prisma: PrismaService) { }
   
   async createChat(createChatInput: CreateChatInput, currentUser: User): Promise<ConversationModel> {
      const { convoName, users } = createChatInput;
      users.filter(id => id !== currentUser.id);
      try {
         this.logger.log(`Finding Users with Id(s): ${[...users]}`);
         const foundUsers = await this.prisma.user.findMany({
            where: {
               id: {
                  in: users
               }
            }
         });
         
         if (!foundUsers || foundUsers.length === 0) {
            this.logger.error("No user with specified Id found");
            throw new NotFoundException("No user with specified Id found");
         }
         const foundChat = await this.prisma.conversation.findFirst({
            where: {
               users: {
                  every: {
                     id: {
                        in: [currentUser.id, ...(foundUsers.map(user => user.id))]
                     }
                  }
               }
            }
         });
         if (foundChat) {
            this.logger.warn("Chat already exist for users");
            throw new NotAcceptableException("Chat already exist for users");
         }
         this.logger.log("Creating chat...")
         const createdChat = await this.prisma.conversation.create({
            data: {
               convoName,
               users: {
                  connect: [currentUser, ...foundUsers]
               }
            },
         });
         return createdChat;
      } catch (error) {
         return error;
      }
   }

   async chat({id}: Prisma.ConversationWhereUniqueInput, currentUser: User): Promise<ConversationModel> {
      const foundChat = await this.prisma.conversation.findUnique({
         where: {
            id: id,
            users: {
               some: currentUser
            }
         },
         include: {
            users: true
         }
      });
      foundChat.convoName = foundChat.users.find(user => user !== currentUser).name;
      return foundChat;
   }

   async chats(currentUser: User): Promise<ConversationModel[]>{
      const foundChats = await this.prisma.conversation.findMany({
         where: {
            users: {
               some: currentUser
            }
         },
         include: {
            users: true
         }
      });
      foundChats.map((chat) => chat.convoName = chat.users.find(user => user !== currentUser).name)
      return foundChats;
   }
}
