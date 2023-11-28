import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe } from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';
import { SignUpInput } from './user.utils';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post("/signup")
  signUp(@Body() signUpInput: SignUpInput) {
    return this.userService.signUp(signUpInput);
  }

  @Post("/signin")
  signIn(@Body() signInInput: Prisma.UserCreateArgs) {
    return this.userService.signIn(signInInput);
  }

  @Get("/findall")
  findAll(@Body() getManyUsersInput?: Prisma.UserFindManyArgs) {
    return this.userService.users(getManyUsersInput);
  }

  @Get('/find/:id')
  findOne(@Param() id: Prisma.UserFindUniqueArgs) {
    return this.userService.user(id);
  }

  @Patch('/update')
  updateUser(@Body() updateUserInput: Prisma.UserUpdateArgs) {
    return this.userService.updateUser(updateUserInput);
  }

  @Delete('/delete/:id')
  removeUser(@Param() id: Prisma.UserFindUniqueArgs) {
    return this.userService.deleteUser(id);
  }
}
