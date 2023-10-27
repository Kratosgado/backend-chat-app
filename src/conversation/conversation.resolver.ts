import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ConversationService } from './conversation.service';
import { Conversation, CreateChatInput, RemoveUserInput } from './conversation-utils.input';
import { Prisma, User } from '@prisma/client';
import { UseGuards } from '@nestjs/common';
import { GetUser, JwtAuthGaurd } from 'src/user/user.auth';

/**
 * Handles Conversation
 */
@Resolver()
@UseGuards(JwtAuthGaurd)
export class ConversationResolver {
  constructor(private readonly conversationService: ConversationService) { }
  
  @Mutation(() => Conversation)
  createChat(
    @Args("createChatInput",) createChatInput: CreateChatInput,
    @GetUser() currentUser: User
  ) {
    return this.conversationService.createChat(createChatInput, currentUser)
  }

  @Mutation(() => String)
  removeUserFromChat(
    @Args("removeUserInput") removeUserInput: RemoveUserInput,
    @GetUser() currentUser: User,
  ) {
    return this.conversationService.removeUserFromChat(removeUserInput, currentUser)
  }

  
  @Query(() => Conversation)
  chat(
    @Args("id") id: string,
    @GetUser() currentUser: User
  ) {
    return this.conversationService.chat(id, currentUser);
  }

  @Query(() => [Conversation])
  chats(
    @GetUser() currentUser: User
  ) {
    return this.conversationService.chats(currentUser);
  }

}
