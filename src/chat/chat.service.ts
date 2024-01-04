import { Injectable, Logger, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { User, Chat, Message } from '@prisma/client';
import { CreateChatDto, SendMessageDto } from '../resources/utils/chat.utils';
import { WsException } from '@nestjs/websockets';
import { ChatGateway } from './chat.gateway';
import { Observable, from, map } from 'rxjs';

@Injectable()
export class ChatService {
   private logger = new Logger("ChatsService");

   constructor(
      private readonly prisma: PrismaService,
      private readonly chatGateway: ChatGateway
   ) { }

   async createChat(createChatDto: CreateChatDto, currentUser: User): Promise<Chat> {
      const { convoName, userIds } = createChatDto;
      // users.filter(id => id !== currentUser.id);
      try {
         this.logger.log(`Finding Users with Id(s): ${[...userIds]}`);
         const foundUsersId = await this.prisma.user.findMany({
            where: {
               id: {
                  in: userIds
               }
            },
            select: {
               id: true
            }
         });

         if (!foundUsersId || foundUsersId.length === 0) {
            this.logger.error("No user with specified Id found");
            throw new NotFoundException("No user with specified Id found");
         }
         // check if chat already exists
         const foundChat = await this.prisma.chat.findFirst({
            where: {
               users: {
                  every: {
                     id: {
                        in: [currentUser.id, ...(foundUsersId.map(user => user.id))]
                     },

                  }
               }
            },
            select: {
               id: true,
               users: {
                  select: {
                     username: true
                  }
               }
            }
         });

         if (foundChat) {
            this.logger.warn("Chat already exist for users");
            return await this.chat(foundChat.id, currentUser);
         };

         this.logger.log("Creating chat...")
         const createdChat = await this.prisma.chat.create({
            data: {
               convoName,
               users: {
                  connect: [
                     { id: currentUser.id },
                     ...foundUsersId
                  ]
               }
            },
            include: {
               users: {
                  select: {
                     id: true,
                     email: true,
                     username: true
                  }
               },
               messages: true,

            }
         });
         this.logger.log(`chat created with id: ${createdChat.id} and ${createdChat.users.length} users`);

         const notCurrentUser = createdChat.users.find(user => user.id !== currentUser.id)
         createdChat.convoName = notCurrentUser ? notCurrentUser.username : "Me";

         userIds.map((id) => {
            this.chatGateway.server.in(id).socketsJoin(createdChat.id);
            this.chatGateway.server.to(id).emit("chatCreated", createdChat);
         });
         this.chatGateway.server.in(currentUser.id).socketsJoin(createdChat.id);
         return createdChat;
      } catch (error) {
         this.logger.error(error)
         return error;
      }
   }

   async chat(id: string, currentUser: User): Promise<Chat> {
      try {
         const foundChat = await this.prisma.chat.findUnique({
            where: {
               id
            },
            include: {
               users: {
                  select: {
                     id: true,
                     email: true,
                     username: true
                  }
               },
               messages: {

                  orderBy: { "createdAt": "asc" }
               }
            }
         });

         if (!foundChat) throw new NotFoundException("Chat Not Found");
         const notCurrentUser = foundChat.users.find(user => user.id !== currentUser.id)
         foundChat.convoName = notCurrentUser ? notCurrentUser.username : "Me";
         return foundChat;
      } catch (error) {
         this.logger.error(error);
         return error;
      }
   }

   /**
    * Retrieves chats of a particular user
    * @param currentUser will be used to personalize returned chats
    * @returns {Promise<Observable<Chat>>}
    */
   async chats(currentUser: User): Promise<Observable<Chat>>{
      try {
         this.logger.log("finding all chats of " + currentUser.username);
         const foundChats = await this.prisma.chat.findMany({
            where: {
               users: {
                  some: {
                     id: currentUser.id
                  }
               }
            },
            include: {
               users: {
                  select: {
                     id: true,
                     email: true,
                     username: true,
                     profilePic: true
                  }
               },
               messages: {
                  select: {
                     text: true
                  },
                  take: 1,
                  orderBy: { "createdAt": "desc" }
               }
            },
         });
         foundChats.map((chat) => {
            const notCurrentUser = chat.users.find((user) => user.id !== currentUser.id);
            chat.convoName = notCurrentUser ? notCurrentUser.username : "Me"
         });
         return from(foundChats).pipe(map((chat) => chat));
      } catch (error) {
         this.logger.error(error);
         return error;
      }
   }


   async deleteChat(id: string) {
      try {
         // find chat to be deleted and the users
         const deletedChat = await this.prisma.chat.findUnique({
            where: { id },
            select: {
               id: true,
               users: true
            }
         });
         if (!deletedChat) throw new WsException("Chat Not Found");

         const transaction = await this.prisma.$transaction([
            this.prisma.message.deleteMany({
               where: {
                  chatId: id
               }
            }),
            this.prisma.chat.delete({
               where: { id }
            }),
         ]);

         deletedChat.users.map((user) => {
            this.chatGateway.server.in(user.id).socketsLeave(deletedChat.id);
            this.chatGateway.server.to(user.id).emit("chatDeleted", deletedChat.id);
         });

         return deletedChat;
      } catch (error) {
         this.logger.error(error);
         return error;
      }
   }
}
