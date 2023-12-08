import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ChatService } from './chat.service';

import { Prisma, User } from '@prisma/client';
import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GetUser, JwtAuthGaurd } from 'src/auth/user.auth';
import { CreateChatDto } from './chat.utils';

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
}
