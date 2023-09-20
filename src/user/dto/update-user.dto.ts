import { PartialType } from '@nestjs/swagger';
import { SignUpUserDto } from './signup-user.dto';

export class UpdateUserDto extends PartialType(SignUpUserDto) {}
