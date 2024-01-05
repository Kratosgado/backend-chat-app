import { WebSocketGateway, SubscribeMessage, MessageBody, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, WsException } from '@nestjs/websockets';
import { ChatsService } from './chats.service';
import { CreateChatDto, SendMessageDto, ServerMessages } from '../resources/utils/chat.utils';
import { User } from '@prisma/client';
import { Logger, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

import { SocketGuard } from 'src/resources/guards/socket.guard';
import { SocketUser } from 'src/resources/decorators/socketUser.decorator';
import { UserService } from 'src/user/user.service';
import { MessageService } from './message.service';
import { SocketService } from './socket.service';

@WebSocketGateway()
@UseGuards(SocketGuard)
@UsePipes(new ValidationPipe())
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly userService: UserService,
    private readonly messageService: MessageService,
    private readonly socketService: SocketService
  ) { }

  private readonly logger = new Logger(ChatsGateway.name);

  @WebSocketServer() server: Server;


  async handleConnection(client: Socket, ...args: any[]) {
    const clientId = client.handshake.query.userId as string;
    this.server.socketsJoin(clientId);
    await this.userService.user(clientId)
      .then(async (user) => await this.chatsService.chats(user)
        .then((chats) => chats.map((chat) => this.server.in(clientId).socketsJoin(chat.id)),),
      );

    this.logger.log(`Client connected: ${clientId}`);
  };

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  };

  // chats
  @SubscribeMessage(ServerMessages.CREATECHAT)
  async createChat(
    @MessageBody() createChatDto: CreateChatDto,
    @SocketUser() currentUser: User,
  ) {
    this.logger.log(`${currentUser.username} creating a chat`);
    const createdChat = await this.chatsService.createChat(createChatDto, currentUser);
    createChatDto.userIds.map(async (id) => {
      await this.socketService.addMessage({
        toId: id,
        itemId: createdChat.id,
        message: ServerMessages.CHATCREATED,

      })
      this.server.in(id).socketsJoin(createdChat.id);
      this.server.to(id).emit(ServerMessages.CHATCREATED, createdChat);
    });
    this.server.in(currentUser.id).socketsJoin(createdChat.id);
    this.server.to(currentUser.id).emit(ServerMessages.CHATCREATED, createdChat);
  }

  @SubscribeMessage(ServerMessages.FINDALLCHATS)
  async findAllChats(
    @SocketUser() currentUser: User,
  ) {
    const chats = await this.chatsService.chats(currentUser);
    this.logger.log("chats found: " + chats.length);
    this.server.to(currentUser.id).emit(ServerMessages.RETURNINGCHATS, chats);
  }

  @SubscribeMessage(ServerMessages.FINDONECHAT)
  async findOneChat(@MessageBody() chatid: string,
    @SocketUser() currentUser: User
  ) {
    this.logger.log(`finding chat with id: ${chatid}`);
    const chat = await this.chatsService.chat(chatid, currentUser);
    this.logger.log("found chat? " + Boolean(chat.id));
    this.server.to(currentUser.id).emit(ServerMessages.RETURNINGCHAT, chat);

  }

  @SubscribeMessage(ServerMessages.DELETECHAT)
  async deleteChat(
    @MessageBody() id: string,
    @SocketUser() currentUser: User,
  ) {
    const deleteChat = await this.chatsService.deleteChat(id);
    if (!(deleteChat instanceof WsException)) {
      deleteChat.users.map(async (user: User) => {
        await this.socketService.addMessage({
          itemId: deleteChat.id,
          message: ServerMessages.CHATDELETED,
          toId: user.id
        })
        this.server.in(user.id).socketsLeave(deleteChat.id);
        this.server.to(user.id).emit(ServerMessages.CHATDELETED, deleteChat.id);
      });
    }
  }

  // messages
  @SubscribeMessage(ServerMessages.SENDMESSAGE)
  async sendMessage(
    @MessageBody() sendMessageDto: SendMessageDto,
    @SocketUser() currentUser: User) {
    this.logger.log("sending message");
    const sentMessage = await this.messageService.sendMessage(sendMessageDto, currentUser);
    this.logger.log("message sent");
    await this.socketService.addMessage({
      itemId: sentMessage.id,
      toId: sentMessage.chatId,
      message: ServerMessages.NEWMESSAGE
    });
    this.server.to(sentMessage.chatId).emit(ServerMessages.NEWMESSAGE, sentMessage);
  }

  // socket message
  @SubscribeMessage(ServerMessages.READY)
  async userReady(@SocketUser() currentUser: User) {
    const unsentMessages = await this.socketService.getUnsentMessages(currentUser);
    unsentMessages.map(async (unsent) => {
      switch (unsent.message) {
        case ServerMessages.NEWMESSAGE:
          const message = await this.messageService.findMessage(unsent.itemId)
          this.server.to(unsent.toId).emit(unsent.message, message);
          break;
        case ServerMessages.CHATCREATED:
          const chat = await this.chatsService.chat(unsent.itemId, currentUser);
          this.server.to(unsent.toId).emit(unsent.message, chat);
          break;
        case ServerMessages.CHATDELETED:
          this.server.to(unsent.toId).emit(unsent.message, unsent.itemId);
          break;
        default:
          break;
      }
    })

  }

  @SubscribeMessage(ServerMessages.DELETESOCKETMESSAGE)
  async deleteSocketMessage(@SocketUser() currentUser: User, @MessageBody() id) {
    await this.socketService.deleteSentMessage(id);
  }
}
