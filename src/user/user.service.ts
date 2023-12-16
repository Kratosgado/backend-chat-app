import { Injectable, Logger, NotFoundException, StreamableFile } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { GetManyUsersInput } from '../resources/utils/user.utils';
import { createReadStream, existsSync } from 'fs';
import { Response } from 'express';


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
   async updateUser(updateUserInput: Prisma.UserUpdateArgs): Promise<User> {

      return await this.prisma.user.update(updateUserInput);
   }

   /**
    * Retrieves a user from the database
    * @param id id of the user to be retrieved
    * @returns {Promise<User | null>} User || null
    */

   async user(id: string): Promise<User | null> {
      return await this.prisma.user.findUnique({where: {id}});
   }

   /**
    * Retrieves users from database
    * @param getManyUsersInput options to retrieve users from database
    * @returns {Promise<User[]>}
    */
   async users(getManyUsersInput: GetManyUsersInput): Promise<User[]> {
      const { skip, take, cursor, search, userIds } = getManyUsersInput ?? {};
      const foundUsers = await this.prisma.user.findMany({
         where: {
            username: { contains: search },
            AND: {
               id: {
                  in: userIds
               }
            }
         },
         // include: {
         //    conversations: false // include conversation when we are not just interested in the users
         // }
      });
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
   async deleteUser(uniqueField: Prisma.UserDeleteArgs) {
      return await this.prisma.user.delete(uniqueField)
   }

   async updateProfilePicture(image: Express.Multer.File, currentUser: User) {
      this.logger.log("filename: " + image.mimetype)
      // const base64 = await encodeImageToBase64(image);
      const base64 = image.buffer.toString('base64');
      this.logger.log("file encoded: " + base64);

      const imagePath = `/uploads/profilePics/${image.filename}`

      await this.prisma.user.update({
         where: { id: currentUser.id },
         data: { profilePic: base64 },
      });
      return { orignalName: image.originalname, filepath: imagePath, base64: base64 };
   }

   async readImageFromBase64(currentUser: User, res: Response) {
      try {
         const base64 = await this.prisma.user.findUnique({
            where: {
               id: currentUser.id
            }
         }).then(user => user.profilePic);
         if (!base64) {
            throw new NotFoundException()
         }

         const base64Image = base64.split(';base64,').pop();
         const imageBuffer = Buffer.from(base64Image, 'base64');

         res.writeHead(200, {
            "Content-Type": 'image/png',
            'Content-Length': imageBuffer.length
         });
         return res.end(imageBuffer);

      } catch (error) {
         throw error
      }
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
