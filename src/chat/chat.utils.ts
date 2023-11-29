import {Chat as ConversationModel, Message, User} from '@prisma/client'

export class Chat implements ConversationModel {
   id: string;
   convoName: string;
   createdAt: Date;
   updatedAt: Date;
   users?: User[];
   messages?: Message[];
}


export class CreateChatInput {
   convoName?: string;
   users: string[];
}

export class RemoveUserInput{
   conversationId: string;
   userIds?: string[];
}
