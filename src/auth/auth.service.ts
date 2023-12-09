import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt'
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'src/resources/utils/user.auth';
import { SignInDto, SignUpDto } from '../resources/utils/auth.utils';

@Injectable()
export class AuthService {
   private readonly logger = new Logger("AuthService");
   constructor(
      private readonly prisma: PrismaService,
      private readonly jwtService: JwtService,
   ) { }

   /**
    * Creates and return a new user
    * @param data user data to be used to create new user
    * @returns {Promise<User>}
    */
   async signUp(signUpInput: SignUpDto): Promise<User> {
      const salt = await bcrypt.genSalt();
      this.logger.log("hashing password")
      signUpInput.password = await this.hashPassword(signUpInput.password, salt);

      try {
         this.logger.log("creating user...")
         const createdUser = await this.prisma.user.create({ data: { ...signUpInput, salt } });
         delete createdUser.password
         delete createdUser.salt

         return createdUser
      } catch (error) {
         this.logger.error(error, error.stack);
         throw new InternalServerErrorException();
      }
   }


   async login(signInInput: SignInDto): Promise<string> {
      const { email, password } = signInInput;
      // find user with provided email
      this.logger.log(`Finding with email: ${email}`)
      const user = await this.prisma.user.findUnique({
         where: { email }
      });
      this.logger.log(`foundUser: ${user.username}`)

      if (user && await this.validatePassword(password, user)) {
         this.logger.log(`foundUser: ${user}`)

         const payload: JwtPayload = { email: user.email }
         const accessToken = this.jwtService.sign(payload)

         this.logger.log(`accessToken: ${accessToken}`);
         return accessToken
      }
      throw new UnauthorizedException();
      // const username = await this.validateUserPassword(signInInput);
   }

   async validateUserByEmail(email: string): Promise<User | null> {
      try {
         this.logger.log(`validating user by email: ${email}`)
         const user = await this.prisma.user.findFirst({
            where: { email }
         })
         return user || null;
      } catch (error) {
         throw new UnauthorizedException();
      }
   }

   async hashPassword(password: string, salt: string): Promise<string> {
      return await bcrypt.hash(password, salt);
   }

   async validatePassword(password: string, user: User): Promise<boolean> {
      const hash = await bcrypt.hash(password, user.salt);
      return hash === user.password;
   }
}
