import { InputType, ObjectType } from "@nestjs/graphql";
import {Message as MessageModel} from '@prisma/client'
import { Conversation } from "src/conversation/conversation-utils.input";
import { User } from "src/user/user-utils.input";


@ObjectType()
export class Message implements MessageModel{
   id: string;
   content: string;
   conversation?: Conversation[]
   conversationId: string;
   user?: User[]
   senderId: string;
   createdAt: Date;
   updatedAt: Date;
}

@InputType()
export class SendMessageInput{
   content: string;
   conversationId: string;
}