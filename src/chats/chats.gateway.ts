import { WebSocketGateway, SubscribeMessage, OnGatewayInit, MessageBody, ConnectedSocket, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { ChatsService } from './chats.service';
import { CreateChatDto, SendMessageDto } from '../resources/utils/chat.utils';
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

  // chats
  @SubscribeMessage('createChat')
  async createChat(
    @MessageBody() createChatDto: CreateChatDto,
    @SocketUser() currentUser: User,
  ) {
    this.logger.log("current user: " + currentUser.username);
    const createdChat = await this.chatsService.createChat(createChatDto, currentUser);
    createChatDto.userIds.map((id) => {
      this.server.in(id).socketsJoin(createdChat.id);
      this.server.to(id).emit("chatCreated", createdChat);
    });
    this.server.in(currentUser.id).socketsJoin(createdChat.id);
    this.server.to(currentUser.id).emit("chatCreated", createdChat);
  }

  @SubscribeMessage('findAllChats')
  async findAllChats(
    @SocketUser() currentUser: User,
  ) {
    const chats = await this.chatsService.chats(currentUser);
    this.logger.log("chats found: " + chats.length);
    this.server.to(currentUser.id).emit("returningChats", chats);
  }

  @SubscribeMessage('findOneChat')
  async findOneChat(@MessageBody() chatid: string,
    @SocketUser() currentUser: User
  ) {
    this.logger.log(`finding chat with id: ${chatid}`);
    const chat = await this.chatsService.chat(chatid, currentUser);
    this.logger.log("found chat? " + Boolean(chat.id));
    this.server.to(currentUser.id).emit("returningChat", chat);
  }

  @SubscribeMessage('deleteChat')
  async deleteChat(
    @MessageBody() id: string,
    @SocketUser() currentUser: User,
  ) {
    const deleteChat = await this.chatsService.deleteChat(id);
    deleteChat.users.map((user) => {
      this.server.in(user.id).socketsLeave(deleteChat.id);
      this.server.to(user.id).emit("chatDeleted", deleteChat.id);
    });
  }

  // messages
  @SubscribeMessage('sendMessage')
  async sendMessage(
    @MessageBody() sendMessageDto: SendMessageDto,
    @SocketUser() currentUser: User) {
    this.logger.log("sending message");
    const sentMessage = await this.chatsService.sendMessage(sendMessageDto, currentUser);
    this.logger.log("message sent");
    this.server.to(sentMessage.chatId).emit("newMessage", sentMessage);
  }
}
