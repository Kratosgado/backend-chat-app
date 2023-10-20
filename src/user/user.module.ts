import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResolver } from './user.resolver';
import { PrismaService } from 'src/prisma.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './user.auth';

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
  providers: [UserResolver, UserService, PrismaService, JwtStrategy],
  exports: [PassportModule, JwtModule, UserService]
})
export class UserModule {}
