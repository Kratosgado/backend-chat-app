import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Res, Put } from '@nestjs/common';
import { UserService } from './user.service';
import { Prisma, User } from '@prisma/client';
import { GetManyUsersInput, UpdateUserInput } from '../resources/utils/user.utils';
import { FileInterceptor } from '@nestjs/platform-express'
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { GetUser } from 'src/resources/decorators/getUser.decorator';
import { JwtAuthGaurd } from 'src/resources/guards/rest.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get("/findall")
  findAll(@Body() getManyUsersInput?: GetManyUsersInput) {
    return this.userService.users(getManyUsersInput);
  }

  @Get('/find/:id')
  findOne(@Param() id: string) {
    return this.userService.user(id);
  }

  @Get('/me')
  @UseGuards(JwtAuthGaurd)
  me(@GetUser() currentUser: User) {
    return currentUser;
  }

  @Patch('/update')
  updateUser(@Body() updateUserInput: UpdateUserInput) {
    return this.userService.updateUser(updateUserInput);
  }

  // @Put('updateProfilePic')
  // @UseGuards(JwtAuthGaurd)
  // @UseInterceptors(FileInterceptor('image'),)
  // updateProfile(@UploadedFile() image: Express.Multer.File, @GetUser() currentUser: User) {
  //   return this.userService.updateProfilePicture(image, currentUser)
  // }

  // @Get('getProfilePic')
  // @UseGuards(JwtAuthGaurd)
  // // @Header('Content-Type', 'application/json')
  // getProfilePicture(@GetUser() currentUser: User, @Res() res: Response) {
  //   return this.userService.readImageFromBase64(currentUser, res);
  // }

  @Delete('/delete/:id')
  removeUser(@Param() id: Prisma.UserFindUniqueArgs) {
    return this.userService.deleteUser(id);
  }
}
