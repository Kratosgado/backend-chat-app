import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { PrismaService } from 'src/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './user.auth';
import { UserController } from './user.controller';

@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt'
    }),
    JwtModule.register({
      secret: process.env.JWTSECRET,
      signOptions: {
        expiresIn: process.env.EXPIRESIN || 27939237
      }
    })
  ],
  controllers: [UserController],
  providers: [UserService, PrismaService, JwtStrategy],
  exports: [PassportModule, JwtModule, UserService]
})
export class UserModule {}
