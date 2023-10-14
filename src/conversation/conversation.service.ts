import { Injectable } from '@nestjs/common';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { User } from 'src/user/entities/user.entity';
import { ConversationRepository } from './conversation.respository';
import { Conversation } from './entities/conversation.entity';

@Injectable()
export class ConversationService {
  constructor(private conversationRepository: ConversationRepository) { }
  
  createConversation(createConversationDto: CreateConversationDto, currentUser: User) : Promise<Conversation>{
    return this.conversationRepository.createConversation(createConversationDto, currentUser);
  }

  getConversations(user: User) : Promise<Conversation[]> {
    return this.conversationRepository.getConversations(user);
  }

  async findOne(id: string): Promise<Conversation> {
    return await this.conversationRepository.findOne({
      select: {
        users: {
          id: true,
          username: true,
          email: true,
        }
      },
      where: { id: id },
    } );
  }

  update(id: number, updateConversationDto: UpdateConversationDto) {
    return `This action updates a #${id} conversation`;
  }

  remove(id: number) {
    return `This action removes a #${id} conversation`;
  }
}
