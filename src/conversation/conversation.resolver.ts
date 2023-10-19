import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ConversationService } from './conversation.service';
import { Conversation, CreateChatInput } from './conversation-utils.input';
import { Prisma } from '@prisma/client';

@Resolver()
export class ConversationResolver {
  constructor(private readonly conversationService: ConversationService) { }
  
  @Mutation(() => Conversation)
  async createChat(@Args("createChatInput", ) createChatInput: CreateChatInput) {
    return this.conversationService.createChat(createChatInput)
  }
}
