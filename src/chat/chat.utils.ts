import { Chat as ConversationModel, Message, User } from '@prisma/client'
import { IsOptional, IsString } from 'class-validator';

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
