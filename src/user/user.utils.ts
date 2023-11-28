import { Chat, Prisma, User as UserModel } from "@prisma/client";
import { IsEmail, IsString, IsStrongPassword, MaxLength, MinLength } from "class-validator";
import * as bcrypt from "bcrypt";
import {PartialType} from '@nestjs/mapped-types'

export class User implements UserModel {
  /// Id of user
   id: string;
   email: string;
   username: string;
   password: string;
   profilePic: string;
   salt: string;
  /// Date of account creation
   createdAt: Date;
   updatedAt: Date;
   conversations: Chat[];

   async validatePassword(password: string): Promise<boolean> {
      const hash = await bcrypt.hash(password, this.salt);
      return hash === this.password;
   }
}

export class GetManyUsersInput{
   skip?: number;
   take?: number;
   cursor?: string;
   search?: string;
   userIds?: string[];
}

export class SignUpInput{
   @IsEmail()
   email: string;

   @IsString()
   @MinLength(4)
   @MaxLength(20)
   username?: string;

   @IsStrongPassword({minLength: 6})
   password: string;
}

export class SignInInput extends PartialType(SignUpInput) {
}

export class UpdateUserInput{
   /// id of the user
   id: string;

   @IsEmail()
   email?: string;
   username?: string;
   password?: string;
}

