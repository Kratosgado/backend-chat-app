import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ChatService } from './chat.service';

import { Prisma, User } from '@prisma/client';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { GetUser, JwtAuthGaurd } from 'src/user/user.auth';

/**
 * Handles Chat
 */
@Controller('chat')
@UseGuards(JwtAuthGaurd)
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

  @Post('/create')
  createChat(
    @Body("createChatInput",) createChatInput: Prisma.ChatCreateInput,
    @GetUser() currentUser: User
  ) {
    return this.chatService.createChat(createChatInput, currentUser)
  }

  @Get('/id')
  chat(
    @Param("id") id: string,
    @GetUser() currentUser: User
  ) {
    return this.chatService.chat({ id }, currentUser);
  }

  @Get('/')
  chats(
    @GetUser() currentUser: User
  ) {
    return this.chatService.chats(currentUser);
  }
}
