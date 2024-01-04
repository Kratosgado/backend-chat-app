import { Injectable, Logger } from "@nestjs/common";
import { User, SocketMessage } from "@prisma/client";
import { PrismaService } from "src/prisma.service";


@Injectable()
export class SocketService {
   private readonly logger = new Logger(SocketService.name);

   constructor(
      private readonly prisma: PrismaService,
   ) { }

   async getUnsentMessages(currentUser: User) : Promise<SocketMessage[]> {
      try {
         return await this.prisma.socketMessage.findMany({
            where: {
               toId: currentUser.id
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
            where: {id}
         })

      } catch (error) {
         this.logger.error(error);
         return error;
      }
   }
}