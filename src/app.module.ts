import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import {ApolloDriver, ApolloDriverConfig} from '@nestjs/apollo'
import { PrismaService } from './prisma.service';
import { ConversationModule } from './conversation/conversation.module';
import { MessageResolver } from './message/message.resolver';
import { MessageService } from './message/message.service';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: true,
      include: [UserModule, ConversationModule],
      introspection: true,
      
    }),
    UserModule,
    ConversationModule,
  ],
  providers: [PrismaService, MessageService]
})
export class AppModule {}
