import { InputType, ObjectType } from "@nestjs/graphql";
import {Conversation as ConversationModel} from '@prisma/client'
import { Message } from "src/message/message-utils.input";
import { User } from "src/user/user-utils.input";

@ObjectType()
export class Conversation implements ConversationModel {
   id: string;
   convoName: string;
   createdAt: Date;
   updatedAt: Date;
   users?: User[];
   messages?: Message[];
}

@InputType()
export class CreateChatInput {
   convoName?: string;
   users: string[];
}

@InputType()
export class RemoveUserInput{
   conversationId: string;
   userIds?: string[];
}
