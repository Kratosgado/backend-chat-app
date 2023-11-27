import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { Prisma, User as UserModel } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import {JwtService} from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { JwtPayload } from './user.auth';

@Injectable()
export class UserService {
   private logger = new Logger("UserService");
   constructor(
      private readonly prisma: PrismaService,
      private jwtService: JwtService
   ) { }
   
   /**
    * Creates and return a new user
    * @param data user data to be used to create new user
    * @returns {Promise<UserModel>}
    */
   async signUp(signUpInput: Prisma.UserCreateInput): Promise<UserModel> {
      signUpInput.salt = await bcrypt.genSalt();
      signUpInput.password = await this.hashPassword(signUpInput.password, signUpInput.salt);
      
      try {
         return await this.prisma.user.create({data: signUpInput});
      } catch (error) {
         throw new InternalServerErrorException();
      }
   }

   async signIn(signInInput: Prisma.UserCreateArgs): Promise<string>{
      const { email, password } = signInInput.data;
      // find user with provided email
      this.logger.log(`Finding with email: ${email}`)
      const user = await this.prisma.user.findUnique({
         where: { email }
      });

      if (user && await this.validatePassword(password, user)) {
         this.logger.log(`foundUser: ${user}`)

         const payload: JwtPayload = {email: user.email}
         const accessToken = this.jwtService.sign(payload)

         this.logger.log(`accessToken: ${accessToken}`);
         return accessToken
      }
      throw new UnauthorizedException();
      // const username = await this.validateUserPassword(signInInput);
   }

   /**
    * Updates a user data
    * @param updateUser update user arguments
    * @returns {Promise<UserModel>}
    */
   async updateUser(updateUserInput: Prisma.UserUpdateArgs): Promise<UserModel>{

      return await this.prisma.user.update(updateUserInput);
   }

   /**
    * Retrieves a user from the database
    * @param id id of the user to be retrieved
    * @returns {Promise<UserModel | null>} UserModel || null
    */
   async user(uniqueField: Prisma.UserFindUniqueArgs): Promise<UserModel | null> {
      return await this.prisma.user.findUnique(uniqueField);
   }

   /**
    * Retrieves users from database
    * @param getManyUsersInput options to retrieve users from database
    * @returns {Promise<UserModel[]>}
    */
   async users(getManyUsersInput: Prisma.UserFindManyArgs): Promise<UserModel[]> {
      // const { skip, take, cursor, where, orderBy } = getManyUsersInput ?? {};
      return await this.prisma.user.findMany(getManyUsersInput);
   }

   /**
    * Deletes a user from database
    * @param id id of the user to be deleted
    * @returns void
    */
   async deleteUser(uniqueField: Prisma.UserFindUniqueArgs) {
      return await this.prisma.user.delete(uniqueField)
   }

   async validateUserByEmail(email: string): Promise<UserModel | null>{
      try {
         this.logger.log(`validating user by email: ${email}`)
         const user = await this.prisma.user.findFirst({
            where: {email}
         })
         return user || null;
      } catch (error) {
         throw new UnauthorizedException();
      }
   }
   async validatePassword(password: string, user: UserModel): Promise<boolean> {
      const hash = await bcrypt.hash(password, user.salt);
      return hash === user.password;
   }

   async hashPassword(password: string, salt: string): Promise<string>{
      return await bcrypt.hash(password, salt);
   }
  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
