import { Injectable, Logger, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, Chat as chatModel, User } from '@prisma/client';

@Injectable()
export class ChatService {
   private logger = new Logger("chatService");

   constructor(private readonly prisma: PrismaService) { }
   
   async createChat(createChatInput: Prisma.ChatCreateInput, currentUser: User): Promise<chatModel> {
      const { convoName, users } = createChatInput;
      // users.filter(id => id !== currentUser.id);
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
         const foundChat = await this.prisma.chat.findFirst({
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
         const createdChat = await this.prisma.chat.create({
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

   async chat({id}: Prisma.ChatWhereUniqueInput, currentUser: User): Promise<chatModel> {
      const foundChat = await this.prisma.chat.findUnique({
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

   async chats(currentUser: User): Promise<chatModel[]>{
      const foundChats = await this.prisma.chat.findMany({
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
