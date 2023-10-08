import { IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";
import { User } from "src/user/entities/user.entity";

export class CreateConversationDto {

   @IsString()
   @MinLength(1)
   @MaxLength(20)
   @IsOptional()
   convoName: string;

   @IsUUID('all')
   userId: string;
}
