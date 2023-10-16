import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '@prisma/client';

@Controller()
export class AppController {
   constructor(private readonly userService: UserService) { }
   
   @Get('user/:id')
   async getPostById(@Param('id') id: string): Promise<User | null> {
      return this.userService.user({id: Number(id)})
   }

   @Post('user')
   async signUpUser(
      @Body() userData: { name?: string; email: string;  password: string}
   ): Promise<User> {
      return this.userService.createUser(userData)
   }
}
