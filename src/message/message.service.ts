import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { Message, SendMessageInput } from './message-utils.input';
import { User } from '@prisma/client';
import { ChatService } from 'src/chat/chat.service';
import { ChatGateway } from 'src/websocket.gateway';
import { Socket } from 'socket.io';

@Injectable()
export class MessageService {
   private readonly logger = new Logger("MessageService");
   constructor(
      private readonly prisma: PrismaService,
      private readonly conversationService: ChatService,
      private readonly chatGateWay: ChatGateway
   ) { }

   async sendMessage(sendMessageInput: SendMessageInput, currentUser: User, client: Socket) {
      try {
         const { content, conversationId } = sendMessageInput;

         this.logger.log("saving message to conversation")
         const message = await this.prisma.message.create({
            data: {
               content,
               senderId: currentUser.id,
               conversationId
            }
         });
         const users = await this.prisma.chat.findUnique({
            where: { id: conversationId },
            include: { users: true }
         }).then((chat) => chat.users)


         this.chatGateWay.server.emit("newMessage", message);
         return `message sent: content = ${message.content}`
      } catch (error) {
         this.logger.log(error)
         return error;
      }
   }
}
