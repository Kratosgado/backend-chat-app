import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpInput } from './auth.utils';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  
  @Post('signup')
  signup(@Body() createUserDto: SignUpInput) {
    return this.authService.signUp(createUserDto);
  }
}
