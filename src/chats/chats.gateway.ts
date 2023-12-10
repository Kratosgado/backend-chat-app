import { WebSocketGateway, SubscribeMessage, OnGatewayInit, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatsService } from './chats.service';
import { CreateChatDto } from '../resources/utils/chat.utils';
import { User } from '@prisma/client';
import { Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { SocketGuard } from 'src/resources/guards/socket.guard';
import { SocketUser } from 'src/resources/decorators/socketUser.decorator';

@WebSocketGateway()
@UseGuards(SocketGuard)
@UsePipes(new ValidationPipe())
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly chatsService: ChatsService) { }

  private readonly logger = new Logger("ChatGateway")

  @WebSocketServer() server: Server;


  handleConnection(client: Socket, ...args: any[]) {
    const clientId = client.handshake.query.userId;
    this.server.socketsJoin(clientId);
    this.logger.log(`Client connected: ${clientId}`);
  };

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  };


  @SubscribeMessage('createChat')
  async create(
    @MessageBody() createChatDto: CreateChatDto,
    @SocketUser() currentUser: User,
  ) {

    const createdChat = await this.chatsService.createChat(createChatDto, currentUser);
    createChatDto.userIds.map((id) => {
      this.server.in(id).socketsJoin(createdChat.id);
      this.server.to(id).emit("chatCreated", createdChat);
    })
    this.server.in(currentUser.id).socketsJoin(createdChat.id);
    this.server.to(currentUser.id).emit("chatCreated", createdChat);
  }

  @SubscribeMessage('findAllChats')
  findAll(
    @SocketUser() currentUser: User,
  ) {
    this.logger.log("finding chats of: " + currentUser.username);
    return this.chatsService.chats(currentUser);
  }

  @SubscribeMessage('findOneChat')
  findOne(@MessageBody() id: string,
    @ConnectedSocket() client: Socket,
    @SocketUser() currentUser: User
  ) {
    return "finding chats"
    // return this.chatsService.chat(id, currentUser);
  }

  // @SubscribeMessage('updateChat')
  // update(@MessageBody() updateChatDto: UpdateChatDto
  // ) {
  //   return this.chatsService.update(updateChatDto.id, updateChatDto);
  // }

  @SubscribeMessage('deleteChat')
  remove(
    @MessageBody() id: string,
    @SocketUser() currentUser: User,
  ) {
    return this.chatsService.deleteChat(id);
  }
}
