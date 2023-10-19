import { InputType, ObjectType } from "@nestjs/graphql";
import { Prisma, User as UserModel } from "@prisma/client";
import { IsEmail, IsString, IsStrongPassword, IsUUID } from "class-validator";
import { Conversation } from "src/conversation/conversation-utils.input";

@ObjectType()
export class User implements UserModel {
  /// Id of user
  id: string;
  email: string;
  name: string;
  password: string;
  /// Date of account creation
  createdAt: Date;
  updatedAt: Date;
  conversations: Conversation[];
}

@InputType()
export class GetManyUsersInput{
   skip?: number;
   take?: number;
   cursor?: string;
   where?: string;
   orderBy?: string;
}

@InputType()
export class CreateUserInput{
   @IsEmail()
   email: string;

   @IsString()
   name?: string;

   @IsStrongPassword({minLength: 6})
   password: string;
}

@InputType()
export class UpdateUserInput{
   /// id of the user
   id: string;

   @IsEmail()
   email?: string;
   name?: string;
   password?: string;
}

