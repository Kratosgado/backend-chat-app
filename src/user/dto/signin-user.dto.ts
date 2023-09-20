import { PickType } from "@nestjs/swagger"
import { SignUpUserDto } from "./signup-user.dto"


export class SignInUserDto extends PickType(SignUpUserDto, ["username", "password"]){}