import { Field, InputType } from "@nestjs/graphql";
import { Prisma } from "@prisma/client";

@InputType()
export class GetManyUsersInput{
   skip?: number;
   take?: number;
   cursor?: Prisma.UserWhereUniqueInput;
   where?: Prisma.UserWhereInput;
   orderBy?: Prisma.UserOrderByWithRelationInput;
}

@InputType()
export class CreateUserInput implements Prisma.UserCreateInput{
   email: string;
   name?: string;
   password: string;
}

@InputType()
export class UpdateUserInput{
   /**
    * id of the user
    */
   id: number;
   email?: string ;
   name?: string;
   password?: string;
}