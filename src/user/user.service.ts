import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { UpdateUserInput, GetManyUsersInput } from 'src/user/user-utils.input';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) { }
   
   /**
    * Creates and return a new user
    * @param data user data to be used to create new user
    * @returns {Promise<User>}
    */
   async createUser(data: Prisma.UserCreateInput): Promise<User> {
      return await this.prisma.user.create({ data });
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
}
