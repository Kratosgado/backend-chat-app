import { Injectable, Logger, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Conversation, CreateChatInput, RemoveUserInput } from './conversation-utils.input';
import { Prisma, Conversation as ConversationModel, User } from '@prisma/client';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ConversationService {
   private logger = new Logger("ConversationService");

   constructor(
      private readonly prisma: PrismaService,
      private readonly userService: UserService,
   ) { }
   
   /**
    * Creates a new chat. Returns found chat if one already exist
    * @param createChatInput Data to create a new comversation
    * @param currentUser Authenticated User
    * @returns {Promise<ConversationModel>}
    */
   async createChat(createChatInput: CreateChatInput, currentUser: User): Promise<ConversationModel> {
      const { convoName, users } = createChatInput;
      users.filter(id => id !== currentUser.id);
      try {
         this.logger.log(`Finding Users with Id(s): ${[...users]}`);
         const foundUsers = await this.prisma.user.findMany({
            where: {
               id: {
                  in: users
               }
            }
         });
         
         if (!foundUsers || foundUsers.length === 0) {
            this.logger.error("No user with specified Id found");
            throw new NotFoundException("No user with specified Id found");
         }
         const foundChat = await this.prisma.conversation.findFirst({
            where: {
               users: {
                  every: {
                     id: {
                        in: [currentUser.id, ...(foundUsers.map(user => user.id))]
                     }
                  }
               }
            }
         });
         if (foundChat) {
            this.logger.warn("Chat already exist for users");
            return foundChat;
         }
         this.logger.log("Creating chat...")
         const createdChat = await this.prisma.conversation.create({
            data: {
               convoName,
               users: {
                  connect: [currentUser, ...foundUsers]
               }
            },
         });
         return createdChat;
      } catch (error) {
         return error;
      }
   }

   /**
    * Retrieves a chat by id specific to the user.
    * @param id {id} of the chat to be retrieved
    * @param currentUser Authenticated User
    * @returns {Promise<ConversationModel>}
    */
   async chat(id: string, currentUser: User): Promise<ConversationModel> {
      const foundChat = await this.prisma.conversation.findUnique({
         where: {
            id,   
         },
         include: {
            users: {where: {id: {not: {equals: currentUser.id}}}},
            messages: true
         }
      });
      this.logger.log(`found users: ${foundChat.users}`)
      foundChat.convoName = foundChat.users.find(user => user.id !== currentUser.id).name;
      return foundChat;
   }

   /**
    * Retrieves a list of personalized conversations
    * @param currentUser Authenticated user
    * @returns {Promise<ConversationModel[]>} 
    */
   async chats(currentUser: User): Promise<ConversationModel[]>{
      const foundChats = await this.prisma.conversation.findMany({
         where: {
            users: {
               some: currentUser
            }
         },
         include: {
            users: { where: { id: { not: { equals: currentUser.id } } } },
            messages: {take: 1, orderBy: {"createdAt": "desc"}}
         }
      });
      foundChats.map((chat) => chat.convoName = chat.users.find(user => user.id !== currentUser.id).name)
      return foundChats;
   }

   /**
    * Removes users from chat. Deletes chat if there's no user left after user removeal
    * @param conversationId Id of chat to remove usre from
    * @param currentUser Authenticated User
    * @param userIds List of id of users to be removed
    * @returns void
    */
   async removeUserFromChat(removeUserInput: RemoveUserInput, currentUser: User): Promise<string> {
      const {conversationId, userIds } = removeUserInput;
      try {
         const foundChat = await this.chat(conversationId, currentUser) as Conversation;
         if (foundChat.users.length === 1) {
            await this.prisma.conversation.delete({ where: { id: foundChat.id } });
            return `Conversation deleted: There was only one user left`
         }
         await this.prisma.$transaction([
            this.prisma.conversation.update({
               where: { id: conversationId },
               data: {
                  users: {
                     disconnect: await this.userService.getUsers({ userIds })
                  }
               }
            })
         ])
         return `User removed from chat: ${userIds}`
      } catch (error) {
         this.logger.error(error);
         return error;
      }
   }
}
