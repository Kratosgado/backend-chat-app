import { Logger, UseGuards } from '@nestjs/common';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GetUser, JwtAuthGaurd } from './auth/user.auth';
import { User } from '@prisma/client';


@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
   private readonly logger = new Logger("ChatGateway")

   @WebSocketServer() server: Server;

   handleConnection(client: Socket, ...args: any[]) {
      this.logger.log(`Client connected: ${client.id}`);
   };

   handleDisconnect(client: Socket) {

      this.logger.log(`Client disconnected: ${client.id}`)
   };

   // @SubscribeMessage('sendMessage')
   // @UseGuards(JwtAuthGaurd)
   // handleSendMessage(
   //    @ConnectedSocket() client: Socket,
   //    @MessageBody() sendMessageInput: SendMessageDto,
   //    @GetUser() user: User
   // ) {
   //    this.logger.log(`Recieved message from client ${client.id}: ${sendMessageInput.content}`);
   //    return this.messageService.sendMessage(sendMessageInput, user);

   // }
}