import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { SendMessageDto } from './message-utils.input';
import { User } from '@prisma/client';
import { ChatService } from 'src/chat/chat.service';
import { ChatGateway } from 'src/websocket.gateway';
import { Socket } from 'socket.io';

// @Injectable()
export class MessageService {
   private readonly logger = new Logger("MessageService");
   constructor(
      private readonly prisma: PrismaService,
      private readonly conversationService: ChatService,
      private readonly chatGateWay: ChatGateway
   ) { }

   async sendMessage(sendMessageDto: SendMessageDto, currentUser: User,
      // client: Socket
   ) {
      try {
         const { content, chatId } = sendMessageDto;

         this.logger.log("saving message to conversation. Message: " + content)
         const message = await this.prisma.message.create({
            data: {
               content: content,
               senderId: currentUser.id,
               chatId
            }
         });
         this.logger.log(`message saved with content: ${message.content}`)
         // const users = await this.prisma.chat.findUnique({
         //    where: { id: conversationId },
         //    include: { users: true }
         // }).then((chat) => chat.users)


         this.chatGateWay.server.emit("newMessage", message);
         return `message sent: content = ${message.content}`
      } catch (error) {
         this.logger.log(error)
         return error;
      }
   }
}
