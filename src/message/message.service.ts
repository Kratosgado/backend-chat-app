import { Injectable, Logger } from '@nestjs/common';

import { PrismaService } from 'src/prisma.service';
import { Message, SendMessageInput } from './message-utils.input';
import { User } from '@prisma/client';
import { ChatService } from 'src/chat/chat.service';

@Injectable()
export class MessageService {
   private readonly logger = new Logger("MessageService");
   constructor(
      private readonly prisma: PrismaService,
      private readonly conversationService: ChatService
   ){}

   async sendMessage(sendMessageInput: SendMessageInput, currentUser: User) {
      const { content, conversationId } = sendMessageInput;
      
      this.logger.log("saving message to conversation")
      const message = await this.prisma.message.create({
         data: {
            content,
            senderId: currentUser.id,
            conversationId
         }
      });
      return `message sent: content = ${message.content}`
   }
}
