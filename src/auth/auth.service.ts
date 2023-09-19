import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import {  UsersRepository } from './user.repository';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { User } from '../user/entities/user.entity';

@Injectable()
export class AuthService {
   constructor(
      private usersRepository: UsersRepository,
      private jwtService: JwtService) { }

   signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
      return this.usersRepository.signUp(authCredentialsDto);
   }

   async signIn(authCredentialsDto: AuthCredentialsDto): Promise<{accessToken: string}> {
      const username = await this.usersRepository.validateUserPassword(authCredentialsDto);
      if (!username) {
         throw new UnauthorizedException('Invalid credentials');
      }

      const payload : JwtPayload = { username };
      const accessToken = await this.jwtService.sign(payload);

      return { accessToken };
   }

   validateUserByUsername(username: string): Promise<User | null> {
      return  this.usersRepository.validateUserByUsername(username);
   }
}
