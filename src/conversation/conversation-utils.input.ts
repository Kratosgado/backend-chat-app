import { InputType, ObjectType } from "@nestjs/graphql";
import {Conversation as ConversationModel, Prisma} from '@prisma/client'
import { User } from "src/user/user-utils.input";

@ObjectType()
export class Conversation implements ConversationModel {
   id: string;
   convoName: string;
   createdAt: Date;
   updatedAt: Date;
   users: User[];
}

@InputType()
export class CreateChatInput {
   convoName?: string;
   users: string[];
}

@InputType()
export class RemoveUserInput{
   conversationId: string
   userIds?: string[]
}

@InputType()
export class SendMessageInput{
   content: string;
   conversationId: string;
}