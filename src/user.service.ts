import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { Prisma, User } from "@prisma/client";
import { GetManyDto, UpdateUser } from "./utils";

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
   async updateUser(updateUser: UpdateUser): Promise<User>{
      return await this.prisma.user.update(updateUser);
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
   async users(getManyDto: GetManyDto): Promise<User[]> {
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
}