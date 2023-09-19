import { IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
   @IsString()
   @MinLength(4)
   @MaxLength(15)
   username: string;

   @IsString()
   @Matches(/\W+@gmail.com/, {message: "enter a valid gmail"})
   email: string;

   @IsString()
   @MinLength(6, {message: "password too short"})
   @MaxLength(15, { message: "password too long" })
   @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/,{ message: 'Password too weak' })
   password: string;
}
