import { ObjectType, Field, Int } from '@nestjs/graphql';
import { User as UserModel} from '@prisma/client';

@ObjectType()
export class User implements UserModel {
  id: number;
  email: string;
  name: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  
}
// @Field(() => Int, { description: 'Example field (placeholder)' })
  // exampleField: number;