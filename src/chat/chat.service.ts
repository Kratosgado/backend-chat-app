import { Injectable, Logger, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, User, Chat } from '@prisma/client';
import { CreateChatInput } from './chat.utils';

@Injectable()
export class ChatService {
   private logger = new Logger("ChatService");

   constructor(private readonly prisma: PrismaService) { }

   async createChat(createChatInput: CreateChatInput, currentUser: User): Promise<Chat> {
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

   async chat(id: string, currentUser: User): Promise<Chat> {
      try {
         const foundChat = await this.prisma.chat.findUnique({
            where: {
               id: id,
               users: {
                  some: currentUser
               }
            },
            include: {
               users: {
                  select: {
                     id: true,
                     email: true,
                     username: true
                  }
               }
            }
         });
         foundChat.convoName = foundChat.users.find(user => user.id !== currentUser.id).username;
         return foundChat;
      } catch (error) {
         this.logger.error(error);
         return error;
      }
   }

   async chats(currentUser: User): Promise<Chat[]> {
      try {
         this.logger.log("finding all chats of " + currentUser.username);
         const foundChats = await this.prisma.chat.findMany({
            where: {
               users: {
                  some: currentUser
               }
            },
            include: {
               users: {
                  select: {
                     id: true,
                     email: true,
                     username: true
                  }
               }
            },
         });
         this.logger.log("chats found: " + foundChats.length)
         foundChats.map((chat) => chat.convoName = chat.users.find(user => user.id !== currentUser.id).username)
         return foundChats;
      } catch (error) {
         this.logger.error(error);
         return error;
      }
   }
}
