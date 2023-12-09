import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './chat.utils';
import { GetUser, JwtAuthGaurd } from 'src/auth/user.auth';
import { User } from '@prisma/client';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
@UseGuards(JwtAuthGaurd)
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatsService: ChatsService) { }

  private readonly logger = new Logger("ChatGateway")

  @WebSocketServer() server: Server;

  handleConnection(client: Socket, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
    
  };

  handleDisconnect(client: Socket) {

    this.logger.log(`Client disconnected: ${client.id}`)
  };

  @SubscribeMessage('createChat')
  create(
    @MessageBody() createChatDto: CreateChatDto,
    @GetUser() currentUser: User,
  ) {
    return this.chatsService.createChat(createChatDto, currentUser);
  }

  @SubscribeMessage('findAllChats')
  findAll(
    @GetUser() currentUser: User,
  ) {
    return this.chatsService.chats(currentUser);
  }

  @SubscribeMessage('findOneChat')
  findOne(@MessageBody() id: string,
    @ConnectedSocket() client: Socket,
    @GetUser() currentUser: User
  ) {
    return this.chatsService.chat(id, currentUser);
  }

  // @SubscribeMessage('updateChat')
  // update(@MessageBody() updateChatDto: UpdateChatDto
  // ) {
  //   return this.chatsService.update(updateChatDto.id, updateChatDto);
  // }

  @SubscribeMessage('deleteChat')
  remove(
    @ConnectedSocket() client: Socket,
    @MessageBody() id: string,
    @GetUser() currentUser: User,
  ) {
    return this.chatsService.deleteChat(id);
  }
}
