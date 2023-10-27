import { Field, InputType, ObjectType, PartialType } from "@nestjs/graphql";
import { Prisma, User as UserModel } from "@prisma/client";
import { IsEmail, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";
import { Conversation } from "src/conversation/conversation-utils.input";
import * as bcrypt from "bcrypt";
@ObjectType()
export class User implements UserModel {
  /// Id of user
   id: string;
   email: string;
   name: string;
   password: string;
   salt: string;
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
   search?: string;
   userIds?: string[];
}

@InputType()
export class SignUpInput{
   @IsEmail()
   email: string;

   @IsString()
   @MinLength(4)
   @MaxLength(20)
   name?: string;

   @IsStrongPassword({minLength: 6})
   password: string;
}

@InputType()
export class SignInInput extends PartialType(SignUpInput) {
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

