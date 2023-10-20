import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { ConversationService } from './conversation.service';
import { Conversation, CreateChatInput } from './conversation-utils.input';
import { Prisma } from '@prisma/client';

/**
 * Handles Conversation
 */
@Resolver()
export class ConversationResolver {
  constructor(private readonly conversationService: ConversationService) { }
  
  @Mutation(() => Conversation)
  createChat(@Args("createChatInput", ) createChatInput: CreateChatInput) {
    return this.conversationService.createChat(createChatInput)
  }

  
  @Query(() => Conversation)
  chat(@Args("id") id: string) {
    return this.conversationService.chat({id});
  }

  @Query(() => [Conversation])
  chats() {
    return this.conversationService.chats();
  }
}
