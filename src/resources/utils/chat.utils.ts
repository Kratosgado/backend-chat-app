import { MessageStatus } from '@prisma/client';
import { IsBase64, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
   @IsString()
   id: string;

   @IsNotEmpty()
   text: string;

   @IsOptional()
   @IsBase64()
   picture?: string;

   @IsNotEmpty()
   chatId: string;
}
export class UpdateMessageDto {
   @IsString()
   id: string;

   @IsNotEmpty()
   chatId: string;

   @IsOptional()
   text: string;
   
   @IsEnum(MessageStatus)
   status: MessageStatus
}

export enum ServerMessages {
   CREATECHAT = "createChat",
   CHATCREATED = "chatCreated",

   SENDMESSAGE = "sendMessage",
   NEWMESSAGE = "newMessage",
   DELETEMESSAGE = "deleteMessage",
   MESSAGEDELETED = 'messageDeleted',
   UPDATEMESSAGE = 'updateMessage',
   MESSAGEUPDATED = 'messageUpdated',

   FINDALLCHATS = 'findAllChats',
   RETURNINGCHATS = "returningChats",

   FINDONECHAT = "findOneChat",
   RETURNINGCHAT = "returningChat",

   DELETECHAT = "deleteChat",
   CHATDELETED = "chatDeleted",

   READY = "ready",
   DELETESOCKETMESSAGE = "deleteSocketMessage"
}