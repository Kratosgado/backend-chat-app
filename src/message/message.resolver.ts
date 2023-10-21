import { Resolver } from '@nestjs/graphql';

@Resolver()
export class MessageResolver {
   constructor(
      private readonly messageService: MessageService
   ){}
}
