import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
   @IsOptional()
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