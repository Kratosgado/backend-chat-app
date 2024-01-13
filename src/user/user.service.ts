import { Injectable, Logger, NotFoundException, StreamableFile } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { GetManyUsersInput, UpdateUserInput } from '../resources/utils/user.utils';
import { createReadStream, existsSync } from 'fs';
import { Response } from 'express';
import { throwError } from 'rxjs';


@Injectable()
export class UserService {
   private logger = new Logger("UserService");
   constructor(
      private readonly prisma: PrismaService,
   ) { }


   /**
    * Updates a user data
    * @param updateUser update user arguments
    * @returns {Promise<User>}
    */
   async updateUser(updateUserInput: UpdateUserInput): Promise<User> {

      try {
         const updatedUser =  await this.prisma.user.update({
            where: { id: updateUserInput.id },
            data: updateUserInput
         });
         delete updatedUser.password;
         delete updatedUser.salt;
         return updatedUser;
      } catch (error) {
         this.logger.error(error);
         throw (error);
      }
   }

   /**
    * Retrieves a user from the database
    * @param id id of the user to be retrieved
    * @returns {Promise<User | null>} User || null
    */

   async user(id: string): Promise<User | null> {
      try {
         this.logger.log("finding user with id: " + id)
         const foundUser = await this.prisma.user.findUnique({ where: { id } });
         if (!foundUser) throw new NotFoundException("User Not Found");
         delete foundUser.password;
         delete foundUser.salt;
         return foundUser
      } catch (error) {
         this.logger.error(error);
         return error;
      }
   }

   /**
    * Retrieves users from database
    * @param getManyUsersInput options to retrieve users from database
    * @returns {Promise<User[]>}
    */
   async users(getManyUsersInput: GetManyUsersInput): Promise<User[]> {
      try {
         const { skip, take, cursor, search, userIds } = getManyUsersInput ?? {};
         this.logger.log("finding all users");
         const foundUsers = await this.prisma.user.findMany({
            where: {
               username: { contains: search },
               AND: {
                  id: {
                     in: userIds
                  }
               }
            },
         });
         foundUsers.map(user => {
            delete user.password,
               delete user.salt;
         });
         return foundUsers
      } catch (error) {
         this.logger.error(error);
         return error;
      }
   }

   /**
    * Deletes a user from database
    * @param id id of the user to be deleted
    * @returns void
    */
   async deleteUser(uniqueField: Prisma.UserDeleteArgs) {
      return await this.prisma.user.delete(uniqueField)
   }

   async updateProfilePicture(image: Express.Multer.File, currentUser: User) {
      this.logger.log("filename: " + image.mimetype)
      // const base64 = await encodeImageToBase64(image);
      const base64 = image.buffer.toString('base64');
      this.logger.log("file encoded");

      const imagePath = `/uploads/profilePics/${image.filename}`

      await this.prisma.user.update({
         where: { id: currentUser.id },
         data: { profilePic: base64 },
      });
      return base64;
   }

   async getProfilePicture(currentUser: User) {
      const base64 = await this.prisma.user.findUnique({
         where: {
            id: currentUser.id
         }
      }).then(user => user.profilePic);
      this.logger.log("base64 retrieved")
      // const image = decodeBase64ToImage(base64, 'profilePic');
      const buffer = Buffer.from(base64, 'base64');
      const file = createReadStream(buffer);
      // await file.pipe(base64,{end: true})
      // this.logger.log('streaming');
      return new StreamableFile(file);
   }
}
