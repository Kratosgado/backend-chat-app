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
   async updateUser(updateUser: UpdateUserInput): Promise<User>{
      const { id, email, name, password } = updateUser;
      return await this.prisma.user.update({
         where: {
            id
         },
         data: updateUser
      });
   }

   /**
    * Retrieves a user from the database
    * @param id id of the user to be retrieved
    * @returns {Promise<User | null>} User || null
    */
   async user(uniqueField: Prisma.UserWhereUniqueInput): Promise<User | null> {
      return await this.prisma.user.findUnique({
         where: uniqueField
      });
   }

   /**
    * Retrieves users from database
    * @param getManyDto options to retrieve users from database
    * @returns {Promise<User[]>}
    */
   async users(getManyDto: GetManyUsersInput): Promise<User[]> {
      // const { skip, take, cursor, where, orderBy } = getManyDto;
      return await this.prisma.user.findMany(getManyDto);
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

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
