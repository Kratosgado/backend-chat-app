import { MessageService } from './message.service';
import { Message, SendMessageInput } from './message-utils.input';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { GetUser, JwtAuthGaurd } from 'src/user/user.auth';
import { User } from '@prisma/client';

@Controller("message")
@UseGuards(JwtAuthGaurd)
export class MessageController {
   constructor(
      private readonly messageService: MessageService
   ) { }
   
   @Post('/send')
   sendMessage(
      @GetUser() currentUser: User,
      @Body() sendMessageInput: SendMessageInput
   ) {
      return this.messageService.sendMessage(sendMessageInput, currentUser);
   }
}
