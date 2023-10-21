import { Injectable, Logger } from '@nestjs/common';
import { ConversationService } from 'src/conversation/conversation.service';
import { PrismaService } from 'src/prisma.service';
import { User } from 'src/user/user-utils.input';
import { SendMessageInput } from './message-utils.input';

@Injectable()
export class MessageService {
   private readonly logger = new Logger("MessageService");
   constructor(
      private readonly prisma: PrismaService,
      private readonly conversationService: ConversationService
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
      return "message saved"
   }
}
