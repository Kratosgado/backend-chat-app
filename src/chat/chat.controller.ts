import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ChatService } from './chat.service';

import { Prisma, User } from '@prisma/client';
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import {  JwtAuthGaurd } from 'src/resources/utils/user.auth';
import { CreateChatDto, SendMessageDto } from '../resources/utils/chat.utils';
import { GetUser } from 'src/resources/decorators/getUser.decorator';

/**
 * Handles Chat
 */
@Controller('chat')
@UseGuards(JwtAuthGaurd)
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post('/create')
  createChat(
    @Body() createChatDto: CreateChatDto,
    @GetUser() currentUser: User
  ) {
    return this.chatService.createChat(createChatDto, currentUser)
  }

  @Get('/:id')
  chat(
    @Param("id") id: string,
    @GetUser() currentUser: User
  ) {
    return this.chatService.chat(id, currentUser);
  }

  @Get('/')
  chats(
    @GetUser() currentUser: User
  ) {
    return this.chatService.chats(currentUser);
  }

  @Delete('/delete')
  deleteChat(@Param() id: string) {
    this.chatService.deleteChat(id);
  }

  @Post('sendMessage')
  sendMessage(@Body() sendMessageDto: SendMessageDto, @GetUser() currentUser) {
    this.chatService.sendMessage(sendMessageDto, currentUser);
  }
}
