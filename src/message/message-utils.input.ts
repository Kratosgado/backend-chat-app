import { InputType, ObjectType } from "@nestjs/graphql";
import { Chat, Message as MessageModel, User } from '@prisma/client'
import { IsNotEmpty } from "class-validator";


export class SendMessageDto {
   @IsNotEmpty()
   content: string;

   @IsNotEmpty()
   chatId: string;
}