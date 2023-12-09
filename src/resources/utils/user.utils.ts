import { Chat, Prisma, User as UserModel } from "@prisma/client";
import { IsEmail, IsString, IsStrongPassword, MaxLength, MinLength, ValidationArguments, ValidationOptions, registerDecorator } from "class-validator";
import * as bcrypt from "bcrypt";
import { PartialType } from '@nestjs/mapped-types'
import { BadRequestException } from "@nestjs/common";


export class GetManyUsersInput {
   skip?: number;
   take?: number;
   cursor?: string;
   search?: string;
   userIds?: string[];
}

export class UpdateUserInput {
   /// id of the user
   id: string;

   @IsEmail()
   email?: string;
   username?: string;
  password?: string;
  
}

export function IsImage(validationOptions?: ValidationOptions) {
   const allowed_image_mime_types = [
     "image/jpeg",
     "image/jpg",
     "image/png",
     "image/gif",
     "image/bmp",
     "image/tiff",
     "image/webp",
   ];
   return function (object: Object, propertyName: string) {
     registerDecorator({
       name: "IsImage",
       target: object.constructor,
       propertyName: propertyName,
       options: validationOptions,
       validator: {
         validate(value: any, args: ValidationArguments) {
           try {
             if (!(value)) {
               throw new BadRequestException(400, "Image file required");
             }
 
             if (!allowed_image_mime_types.includes(value.mimetype)) {
               throw new BadRequestException(400, `Only ${allowed_image_mime_types.join(", ")} types are allowed`);
             }
 
             return true; // If all checks pass, return true
           } catch (error: any) {
             if (error instanceof BadRequestException) throw error; // If any check fails, return false
             return false;
           }
         },
         defaultMessage(args: ValidationArguments) {
           return "Uploaded file is invalid"
         }
       },
     });
   }
 }
 