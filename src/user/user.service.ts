import { Injectable, InternalServerErrorException, Logger, StreamableFile, UnauthorizedException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { JwtPayload } from './user.auth';
import { anotherEncodeToBase64, decodeBase64ToImage, encodeImageToBase64 } from 'src/utils/encodeImageToBase64.util';
import { SignInInput, SignUpInput } from './user.utils';
import { createReadStream } from 'fs';
import { join } from 'path';
import { File } from 'buffer';

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
    * @returns {Promise<User>}
    */
   async signUp(signUpInput: SignUpInput): Promise<User> {
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

   async signIn(signInInput: SignInInput): Promise<string> {
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

   /**
    * Updates a user data
    * @param updateUser update user arguments
    * @returns {Promise<User>}
    */
   async updateUser(updateUserInput: Prisma.UserUpdateArgs): Promise<User> {

      return await this.prisma.user.update(updateUserInput);
   }

   /**
    * Retrieves a user from the database
    * @param id id of the user to be retrieved
    * @returns {Promise<User | null>} User || null
    */
   async user(uniqueField: Prisma.UserFindUniqueArgs): Promise<User | null> {
      return await this.prisma.user.findUnique(uniqueField);
   }

   /**
    * Retrieves users from database
    * @param getManyUsersInput options to retrieve users from database
    * @returns {Promise<User[]>}
    */
   async users(getManyUsersInput: Prisma.UserFindManyArgs): Promise<User[]> {
      // const { skip, take, cursor, where, orderBy } = getManyUsersInput ?? {};
      const foundUsers = await this.prisma.user.findMany(getManyUsersInput);
      foundUsers.map(user => {
         delete user.password,
            delete user.salt;
      });
      return foundUsers
   }

   /**
    * Deletes a user from database
    * @param id id of the user to be deleted
    * @returns void
    */
   async deleteUser(uniqueField: Prisma.UserFindUniqueArgs) {
      return await this.prisma.user.delete(uniqueField)
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

   async updateProfilePicture(image: Express.Multer.File, currentUser: User) {
      this.logger.log("filename: " + image.mimetype)
      // const profilePic = await encodeImageToBase64(image);
      const profilePic = await image.buffer.toString("base64")
      this.logger.log("file encoded: " + profilePic);
      const user = await this.prisma.user.update({
         where: { id: currentUser.id },
         data: { profilePic },
      });

      delete user.password; delete user.salt;
      return user;
   }

   async getProfilePicture(currentUser: User) {
      const base64 = await this.prisma.user.findUnique({
         where: {
            id: currentUser.id
         }
      }).then(user => user.profilePic);
      this.logger.log("base64 retrieved")
      // const image = decodeBase64ToImage(base64, 'profilePic');
      const buffer = Buffer.from(base64);
      const file = createReadStream(buffer);
      // await file.pipe(base64,{end: true})
      // this.logger.log('streaming');
      return new StreamableFile(file);
   }

   async hashPassword(password: string, salt: string): Promise<string> {
      return await bcrypt.hash(password, salt);
   }

   async validatePassword(password: string, user: User): Promise<boolean> {
      const hash = await bcrypt.hash(password, user.salt);
      return hash === user.password;
   }
}
