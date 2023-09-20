import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { Conversation } from "./entities/conversation.entity";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { User } from "src/user/entities/user.entity";
import { UserRepository } from "src/user/user.repository";

import { v4 as uuid } from "uuid";


@Injectable()
export class ConversationRepository extends Repository<Conversation> {
   private logger = new Logger("ConversationRepository");
   constructor(
      private datasource: DataSource,
      private userRepository: UserRepository
   ) {
      super(Conversation, datasource.createEntityManager());
   }

   async createConversation(createConversationDto: CreateConversationDto, currentUser: User): Promise<Conversation> {
      let { userIds, convoName } = createConversationDto;
      userIds = userIds.filter((userId) => userId !== currentUser.id);

      const chatUsers: User[] = [];

      for (let userId in userIds) {
         const foundUser = await this.userRepository.findOneBy({ id: userId }).then((user) => user)
         if (!foundUser) {
            this.logger.error(`There's no user with id: ${userId}`);
            throw new NotFoundException(`There's no user with id: ${userId}`)
         }
         this.logger.log(`userId: ${userId} added to chatUsers list`);
         chatUsers.push(foundUser);
      }

      const newConversation = new Conversation();
      newConversation.id = uuid();
      newConversation.users = [...chatUsers, currentUser];
      newConversation.convoName = convoName ? convoName : "New chat";
      try {
         this.save(newConversation);
         this.logger.log(`created with id: ${newConversation.id}`);
         return newConversation;
      } catch (error) {
         this.logger.error('could not create conversation');
         throw new InternalServerErrorException("Could not create conversation");
      }
      

   }
}