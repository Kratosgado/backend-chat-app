import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from '../auth/user.auth';
import { UserController } from './user.controller';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [

    // MulterModule.register({
    //   dest: './uploads/profilePics'
    // }),
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService],
  exports: [ UserService]
})
export class UserModule { }
