import { Chat as ConversationModel, Message, User } from '@prisma/client'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class Chat implements ConversationModel {
   id: string;
   convoName: string;
   createdAt: Date;
   updatedAt: Date;
   users?: User[];
   messages?: Message[];
}


export class CreateChatDto {
   // @IsOptional()
   convoName?: string;

   @IsString({ each: true })
   userIds: string[];
}

export class RemoveUserInput {
   conversationId: string;
   userIds?: string[];
}


export class SendMessageDto {
   @IsNotEmpty()
   content: string;

   @IsNotEmpty()
   chatId: string;
}