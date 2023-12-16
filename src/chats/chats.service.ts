import { Injectable, Logger, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, User, Chat, Message } from '@prisma/client';
import { CreateChatDto, SendMessageDto } from '../resources/utils/chat.utils';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class ChatsService {
   private logger = new Logger("ChatsService");

   constructor(private readonly prisma: PrismaService,
   ) { }

   async createChat(createChatDto: CreateChatDto, currentUser: User): Promise<Chat> {
      const { convoName, userIds } = createChatDto;
      // users.filter(id => id !== currentUser.id);
      try {
         this.logger.log(`Finding Users with Id(s): ${[...userIds]}`);
         const foundUsers = await this.prisma.user.findMany({
            where: {
               id: {
                  in: userIds
               }
            }
         });

         if (!foundUsers || foundUsers.length === 0) {
            this.logger.error("No user with specified Id found");
            throw new NotFoundException("No user with specified Id found");
         }
         // check if chat already exists
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
            throw new WsException("Chat already exist for users");
         }
         this.logger.log("Creating chat...")
         const createdChat = await this.prisma.chat.create({
            data: {
               convoName,
               users: {
                  connect: [currentUser, ...foundUsers]
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
         this.logger.log(`chat created with id: ${createdChat.id}`);
         createdChat.convoName = createdChat.users.find(user => user.id !== currentUser.id).username;

         return createdChat;
      } catch (error) {
         throw error;
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

         foundChat.convoName = foundChat.users.find(user => user.id !== currentUser.id).username;
         return foundChat;
      } catch (error) {
         this.logger.error(error);
         throw error;
      }
   }

   async chats(currentUser: User): Promise<Chat[]> {
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
                     username: true
                  }
               },
               messages: {
                  select: {
                     content: true
                  },
                  take: 1,
                  orderBy: { "createdAt": "desc" }
               }
            },
         });
         foundChats.map((chat) => chat.convoName = chat.users.find(user => user.id !== currentUser.id).username)
         return foundChats;
      } catch (error) {
         this.logger.error(error);
         throw error;
      }
   }


   async sendMessage(sendMessageDto: SendMessageDto, currentUser: User,
      // client: Socket
   ): Promise<Message> {
      try {
         const { content, chatId } = sendMessageDto;

         this.logger.log(`fingind chat with id: ${chatId}`);
         const foundChat = await this.prisma.chat.count({
            where: { id: chatId },
         });
         if (!foundChat) throw new WsException("Chat Not Found");

         this.logger.log("saving message to conversation. Message: " + content)
         const message = await this.prisma.message.create({
            data: {
               content,
               senderId: currentUser.id,
               chatId: chatId
            }
         });
         if (!message) throw new WsException("message not sent")
         this.logger.log(`message saved with content: ${message.content}`)
         return message
      } catch (error) {
         this.logger.log(error)
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
         ])
         
         return deletedChat;
      } catch (error) {
         this.logger.error(error);
         throw error;
      }
   }
}
