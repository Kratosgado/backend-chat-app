import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsString, MinLength, MaxLength, IsStrongPassword } from "class-validator";

export class SignUpInput {
   @IsEmail()
   email: string;

   @IsString()
   @MinLength(4)
   @MaxLength(20)
   username?: string;

   @IsStrongPassword({ minLength: 6 })
   password: string;
}

export class SignInInput extends PartialType(SignUpInput) {
}
