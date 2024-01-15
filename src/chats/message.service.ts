import { Injectable, Logger } from "@nestjs/common";
import { WsException } from "@nestjs/websockets";
import { User, Message, MessageStatus } from "@prisma/client";
import { PrismaService } from "src/prisma.service";
import { SendMessageDto } from "src/resources/utils/chat.utils";


@Injectable()
export class MessageService {
   private readonly logger = new Logger(MessageService.name);

   constructor(
      private readonly prisma: PrismaService,
   ) { }

   async sendMessage(sendMessageDto: SendMessageDto, currentUser: User,
      // client: Socket
   ): Promise<Message> {
      try {
         const { id, text, picture, chatId } = sendMessageDto;

         this.logger.log(`fingind chat with id: ${chatId}`);
         const foundChat = await this.prisma.chat.count({
            where: { id: chatId },
         });
         if (!foundChat) throw new WsException({ status: 404, message: "Chat Not Found" });

         this.logger.log("saving message to conversation. Message: " + text)
         const message = await this.prisma.message.create({
            data: { id, text, picture, chatId, senderId: currentUser.id }
         });
         if (!message) throw new WsException({ status: 500, message: "Message not Sent" });
         this.logger.log(`message saved with text: ${message.text}`)
         return message
      } catch (error) {
         this.logger.log(error)
         throw error;
      }
   };

   async findMessage(id: string) {
      try {
         return await this.prisma.message.findUnique({ where: { id } });
      } catch (error) {
         this.logger.error(error);
         return error;
      }
   }

   async changeStatus(id: string, status: MessageStatus) {
      try {
         await this.prisma.message.update({
            where: { id },
            data: {
               status
            }
         });
         return true;
      } catch (error) {
         this.logger.error(error);
         return false;
      }
   };

   async deleteMessage(id: string) {
      try {
         const deletedMessage = await this.prisma.message.delete({
            where: { id }
         });
         return deletedMessage.chatId
      } catch (error) {
         this.logger.error(error);
         return false;
      }
   }
}