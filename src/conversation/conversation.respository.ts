import { Injectable, InternalServerErrorException, Logger, NotFoundException } from "@nestjs/common";
import { ArrayContains, DataSource, Repository } from "typeorm";
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
      const { userId, convoName } = createConversationDto;

      const chatUsers: User[] = [currentUser];
      this.logger.log("Finding user " + userId);
      const foundUser = await this.userRepository.findOneBy({ id: userId }).then((user) => user)
      if (!foundUser) {
         this.logger.error(`There's no user with id: ${userId}`);
         throw new NotFoundException(`There's no user with id: ${userId}`)
      }
      this.logger.log(`userId: ${userId} added to chatUsers list`);
      chatUsers.push(foundUser);
      

      try {
         this.logger.log("creating conversation");
         const newConvo = new Conversation();
         newConvo.id = uuid();
         newConvo.convoName = convoName ? convoName : "new chat";
         newConvo.users = chatUsers;
         // const newConvo = this.create({
         //    id: uuid(),
         //    users: chatUsers,
         //    convoName: convoName ? convoName : "new chat"
         // });
         await this.save(newConvo);
         this.logger.log(`created with id: ${newConvo.id}`);
         return newConvo;
         
      } catch (error) {
         this.logger.error('could not create conversation');
         throw new InternalServerErrorException("Could not create conversation");
      }
   }

   async getConversations(currentUser: User): Promise<Conversation[]>{
      return this.find({
         select: {
            users: {
               id: true,
               username: true,
               email: true,
            },
         },
         where: {
            users: {
               id: currentUser.id
            }
         }
      });
   }
}