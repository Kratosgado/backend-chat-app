import { InputType, ObjectType } from "@nestjs/graphql";
import {Chat, Message as MessageModel, User} from '@prisma/client'


export class Message implements MessageModel{
   id: string;
   content: string;
   conversation?: Chat[]
   conversationId: string;
   user?: User[]
   senderId: string;
   createdAt: Date;
   updatedAt: Date;
}

export class SendMessageInput{
   content: string;
   conversationId: string;
}