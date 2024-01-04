import { IsBase64, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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

export enum MessageStatus {
   SENT = "SENT",
   DELIVERED = "DELIVERED",
   READ = "READ"
}

export class SendMessageDto {
   @IsNotEmpty()
   text: string;

   @IsOptional()
   @IsBase64()
   picture?: string;

   @IsNotEmpty()
   chatId: string;
}