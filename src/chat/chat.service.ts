import { Injectable, Logger, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Prisma, User, Chat } from '@prisma/client';
import { CreateChatDto } from './chat.utils';
import { SendMessageDto } from 'src/message/message-utils.input';
import { ChatGateway } from 'src/websocket.gateway';

@Injectable()
export class ChatService {
   private logger = new Logger("ChatService");

   constructor(private readonly prisma: PrismaService,
      private readonly chatGateway: ChatGateway,
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
               messages: true
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
         this.logger.log("chats found: " + foundChats.length)
         foundChats.map((chat) => chat.convoName = chat.users.find(user => user.id !== currentUser.id).username)
         return foundChats;
      } catch (error) {
         this.logger.error(error);
         throw error;
      }
   }


   async sendMessage(sendMessageDto: SendMessageDto, currentUser: User,
      // client: Socket
   ) {
      try {
         const { content, chatId } = sendMessageDto;

         this.logger.log(`fingind chat with id: ${chatId}`);
         this.logger.log("saving message to conversation. Message: " + content)
         const foundChat = await this.prisma.chat.findUnique({
            where: { id: chatId },
         });
         if (!foundChat) throw new NotFoundException("Chat Not Found");


         const message = await this.prisma.message.create({
            data: {
               content,
               senderId: currentUser.id,
               chatId: chatId
            }
         });
         this.logger.log(`message saved with content: ${message.content}`)
         // const users = await this.prisma.chat.findUnique({
         //    where: { id: conversationId },
         //    include: { users: true }
         // }).then((chat) => chat.users)


         this.chatGateway.server.emit("newMessage", message);
         return `message sent: content = ${message.content}`
      } catch (error) {
         this.logger.log(error)
         return error;
      }
   }

   async deleteChat(id: string) {
      try {
         await this.prisma.chat.delete({ where: { id } });
      } catch (error) {
         this.logger.error(error);
         throw error;
      }
   }
}
