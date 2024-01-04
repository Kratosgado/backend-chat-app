import { Injectable, Logger } from "@nestjs/common";
import { User, SocketMessage, Prisma } from "@prisma/client";
import { PrismaService } from "src/prisma.service";


@Injectable()
export class SocketService {
   private readonly logger = new Logger(SocketService.name);

   constructor(
      private readonly prisma: PrismaService,
   ) { }

   async addMessage(data: Prisma.SocketMessageCreateInput) {
      try {
         await this.prisma.socketMessage.create({ data });
         return true
      } catch (error) {
         this.logger.error(error);
         return false
      }
   }

   async getUnsentMessages(currentUser: User): Promise<SocketMessage[]> {

      try {
         const userChatIds = await this.prisma.chat.findMany({
            where: {
               users: {
                  some: {
                     id: currentUser.id
                  }
               }
            }
         }).then(chats => chats.map(chat => chat.id));
         return await this.prisma.socketMessage.findMany({
            where: {
               toId: {
                  in: [currentUser.id, ...userChatIds]
               },

            }
         });
      } catch (error) {
         this.logger.error(error);
         return error;
      }
   }

   async deleteSentMessage(id: string) {
      try {
         await this.prisma.socketMessage.delete({
            where: { id }
         })

      } catch (error) {
         this.logger.error(error);
         return error;
      }
   }
}