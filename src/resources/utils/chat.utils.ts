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

export enum ServerMessages {
   CREATECHAT = "createChat",
   CHATCREATED = "chatCreated",

   SENDMESSAGE = "sendMessage",
   NEWMESSAGE = "newMessage",

   FINDALLCHATS = 'findAllChats',
   RETURNINGCHATS = "returningChats",

   FINDONECHAT = "findOneChat",
   RETURNINGCHAT = "returningChat",

   DELETECHAT = "deleteChat",
   CHATDELETED = "chatDeleted",

   READY = "ready",
   DELETESOCKETMESSAGE = "deleteSocketMessage"
}