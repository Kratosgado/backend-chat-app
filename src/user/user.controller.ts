import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma } from '@prisma/client';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Post("/signup")
  signUp(@Body('signUpInput') signUpInput: Prisma.UserCreateInput) {
    return this.userService.signUp(signUpInput);
  }

  @Post("/signin")
  signIn(@Body('signInInput') signInInput: Prisma.UserCreateArgs) {
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
