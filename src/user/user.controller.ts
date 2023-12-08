import { Controller, Get, Post, Body, Patch, Param, Delete, ValidationPipe, UseInterceptors, UploadedFile, UseGuards, Res, Header } from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma, User } from '@prisma/client';
import { GetManyUsersInput } from './user.utils';
import { FileInterceptor } from '@nestjs/platform-express'
import { GetUser, JwtAuthGaurd } from '../auth/user.auth';
import { AuthGuard } from '@nestjs/passport';
import { diskStorage } from 'multer';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get("/findall")
  findAll(@Body() getManyUsersInput?: GetManyUsersInput) {
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

  @Post('updateProfilePic')
  @UseGuards(JwtAuthGaurd)
  @UseInterceptors(FileInterceptor('image'),)
  updateProfile(@UploadedFile() image: Express.Multer.File, @GetUser() currentUser: User) {
    return this.userService.updateProfilePicture(image, currentUser)
  }

  @Get('getProfilePic')
  @UseGuards(JwtAuthGaurd)
  // @Header('Content-Type', 'application/json')
  getProfilePicture(@GetUser() currentUser: User, @Res() res: Response) {
    return this.userService.readImageFromBase64(currentUser, res);
  }

  @Delete('/delete/:id')
  removeUser(@Param() id: Prisma.UserFindUniqueArgs) {
    return this.userService.deleteUser(id);
  }
}
