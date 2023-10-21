import { InputType, ObjectType } from "@nestjs/graphql";
import {Message as MessageModel} from '@prisma/client'

ObjectType()
export class Message implements MessageModel{
   id: string;
   createdAt: Date;
   updatedAt: Date;
   content: string;
   conversationId: string;
   senderId: string;
}

@InputType()
export class SendMessageInput{
   content: string;
   conversationId: string;
}