import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { MessageService } from './message.service';
import { Message, SendMessageInput } from './message-utils.input';
import { UseGuards } from '@nestjs/common';
import { GetUser, JwtAuthGaurd } from 'src/user/user.auth';
import { User } from 'src/user/user-utils.input';
import { Conversation } from 'src/conversation/conversation-utils.input';

@Resolver()
@UseGuards(JwtAuthGaurd)
export class MessageResolver {
   constructor(
      private readonly messageService: MessageService
   ) { }
   
   @Mutation(() => String)
   sendMessage(
      @GetUser() currentUser: User,
      @Args('sendMessageInput') sendMessageInput: SendMessageInput
   ) {
      return this.messageService.sendMessage(sendMessageInput, currentUser);
   }
}
