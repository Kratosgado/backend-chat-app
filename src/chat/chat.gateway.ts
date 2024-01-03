import { Logger, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { User } from '@prisma/client';
import { ChatService } from './chat.service';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma.service';


@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
   private readonly logger = new Logger("ChatGateway")
   constructor(
      private readonly prisma: PrismaService,
      private readonly userService: UserService,
   ) { }

   @WebSocketServer() server: Server;

   async handleConnection(client: Socket, ...args: any[]) {
      const clientId = client.handshake.query.userId as string;
      this.server.socketsJoin(clientId);
      await this.userService.user(clientId)
         .then(async (user) => await this.prisma.chat.findMany({ where: { users: { some: { id: clientId } } } })
            .then((chats) => chats.map((chat) => this.server.in(clientId).socketsJoin(chat.id)),),
         );

      this.logger.log(`Client connected: ${clientId}`);
   };

   handleDisconnect(client: Socket) {
      this.logger.log(`Client disconnected: ${client.id}`)
   };

}