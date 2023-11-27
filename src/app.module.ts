import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { PrismaService } from './prisma.service';
import { ConversationModule } from './conversation/conversation.module';
import { MessageService } from './message/message.service';
import { ConversationService } from './conversation/conversation.service';
import { ApolloServerPluginLandingPageDisabled } from '@apollo/server/plugin/disabled'

@Module({
  imports: [
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      playground: true,
      autoSchemaFile: true,
      // include: [UserModule, ConversationModule, MessageModule],
      introspection: true,
      installSubscriptionHandlers: true,
      // context: ({ req }) => ({ req }),
      // // uploads: false,
      // plugins: [
      //   ApolloServerPluginLandingPageDisabled(),
      // ]
    }),
    UserModule,
    ConversationModule,
  ],
  providers: [PrismaService, MessageService, ConversationService]
})
export class AppModule { }

