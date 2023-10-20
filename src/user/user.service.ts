import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UpdateUserInput, GetManyUsersInput, SignInInput } from 'src/user/user-utils.input';
import * as bcrypt from 'bcrypt'
@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }
   
   /**
    * Creates and return a new user
    * @param data user data to be used to create new user
    * @returns {Promise<User>}
    */
   async signUp(data: Prisma.UserCreateInput): Promise<User> {
      return await this.prisma.user.create({ data });
   }

   async signIn(signInInput: SignInInput): Promise<{ acessToken: string }>{
      const { email, password } = signInInput;
      // find user with provided email
      const user = await this.prisma.user.findUnique({
         where: { email }
      });

      if (user && await user(password)) {
         return 
      }
      return null;
      // const username = await this.validateUserPassword(signInInput);
   }

   /**
    * Updates a user data
    * @param updateUser update user arguments
    * @returns {Promise<User>}
    */
   async updateUser(updateUserInput: UpdateUserInput): Promise<User>{

      return await this.prisma.user.update({
         where: { id: updateUserInput.id },
         data: updateUserInput
      });
   }

   /**
    * Retrieves a user from the database
    * @param id id of the user to be retrieved
    * @returns {Promise<User | null>} User || null
    */
   async user(uniqueField: Prisma.UserWhereUniqueInput): Promise<User | null> {
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
    * @returns {Promise<User[]>}
    */
   async users(getManyUsersInput: GetManyUsersInput): Promise<User[]> {
      const { skip, take, cursor, where, orderBy } = getManyUsersInput ?? {};
      return await this.prisma.user.findMany({
         where: {
            name: {contains: where}
         },
         include: {
            conversations: true
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

   async validateToken(email: string): Promise<User | null>{
      try {
         const user = await this.prisma.user.findUnique({
            where: {email}
         })
         return user || null;
      } catch (error) {
         throw new UnauthorizedException();
      }
   }

   async validatePassword(password: string, user: User): Promise<boolean>{
      const hash = await bcrypt.hash(password, user.salt);
      return hash === user.password;
   }
}
