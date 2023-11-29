import { Injectable, InternalServerErrorException, Logger, NotFoundException, StreamableFile, UnauthorizedException } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { JwtPayload } from './user.auth';
import { anotherEncodeToBase64, decodeBase64ToImage, encodeImageToBase64 } from 'src/utils/encodeImageToBase64.util';
import { GetManyUsersInput, SignInInput, SignUpInput } from './user.utils';
import { createReadStream, existsSync } from 'fs';
import { Response } from 'express';


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
   async users(getManyUsersInput: GetManyUsersInput): Promise<User[]> {
      const { skip, take , search, userIds} = getManyUsersInput ?? {};
      const foundUsers = await this.prisma.user.findMany({
         where: {
            username: { contains: search },
            id: {in: userIds},
         },
         take, skip
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

   readFromFile(filepath: string): StreamableFile {
      try {
         if (!existsSync(filepath)) {
            throw new NotFoundException()
         }
         const fileStream = createReadStream(filepath);
         return new StreamableFile(fileStream);
      } catch (error) {
         throw error;
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

   async hashPassword(password: string, salt: string): Promise<string> {
      return await bcrypt.hash(password, salt);
   }

   async validatePassword(password: string, user: User): Promise<boolean> {
      const hash = await bcrypt.hash(password, user.salt);
      return hash === user.password;
   }
}
