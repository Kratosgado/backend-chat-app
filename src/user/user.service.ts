import { Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { Prisma, User as UserModel } from '@prisma/client';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt'
import { UpdateUserInput, GetManyUsersInput, SignInInput, User, SignUpInput } from 'src/user/user-utils.input';
import * as bcrypt from 'bcrypt'
import { JwtPayload } from './user.auth';
import { FileUpload } from 'graphql-upload';
import { encodeImageToBase64 } from 'src/utils/encodeImageToBase64.util';

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
   async signUp(signUpInput: SignUpInput): Promise<UserModel> {
      const data = signUpInput as Prisma.UserCreateInput;
      data.salt = await bcrypt.genSalt();
      data.password = await this.hashPassword(data.password, data.salt);

      try {
         return await this.prisma.user.create({ data });
      } catch (error) {
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
    * @returns {Promise<UserModel>}
    */
   async updateUser(updateUserInput: UpdateUserInput): Promise<UserModel> {

      return await this.prisma.user.update({
         where: { id: updateUserInput.id },
         data: updateUserInput
      });
   }

   /**
    * Retrieves a user from the database
    * @param id id of the user to be retrieved
    * @returns {Promise<UserModel | null>} UserModel || null
    */
   async user(uniqueField: Prisma.UserWhereUniqueInput): Promise<UserModel | null> {
      return await this.prisma.user.findUnique({
         where: uniqueField,
         include: {
            conversations: true
         }
      });
   }

   /**
    * Retrieves users from database
    * @param getManyUsersInput options to retrieve users from database
    * @returns {Promise<UserModel[]>}
    */
   async getUsers(getManyUsersInput: GetManyUsersInput): Promise<UserModel[]> {
      const { skip, take, cursor, search, userIds } = getManyUsersInput ?? {};
      return await this.prisma.user.findMany({
         where: {
            name: { contains: search },
            AND: {
               id: {
                  in: userIds
               }
            }
         },
         include: {
            conversations: !userIds // include conversation when we are not just interested in the users
         }
      });
   }

   /**
    * Deletes a user from database
    * @param id id of the user to be deleted
    * @returns void
    */
   async deleteUser(uniqueField: Prisma.UserWhereUniqueInput) {
      return await this.prisma.user.delete({
         where: uniqueField
      })
   }

   async validateUserByEmail(email: string): Promise<UserModel | null> {
      try {
         const user = await this.prisma.user.findFirst({
            where: { email }
         })
         return user || null;
      } catch (error) {
         throw new UnauthorizedException();
      }
   }

   async updateProfilePicture(file: FileUpload, currentUser: User) {
      const profilePic = await encodeImageToBase64(file);
      return this.prisma.user.update({
         where: { id: currentUser.id },
         data: { profilePic },
      });
   }

   async validatePassword(password: string, user: UserModel): Promise<boolean> {
      const hash = await bcrypt.hash(password, user.salt);
      return hash === user.password;
   }

   async hashPassword(password: string, salt: string): Promise<string> {
      return await bcrypt.hash(password, salt);
   }
}
