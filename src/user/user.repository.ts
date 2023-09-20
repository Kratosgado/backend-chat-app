import { ConflictException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from "@nestjs/common";
import { DataSource, Repository } from "typeorm";
import { User } from "./entities/user.entity";

import * as bcrypt from 'bcrypt';
import { SignInUserDto } from "./dto/signin-user.dto";
import { SignUpUserDto } from "./dto/signup-user.dto";


@Injectable()
export class UserRepository extends Repository<User> {
   // use for logging to console
   private logger = new Logger("UserRepository");

   constructor(private datasource: DataSource) {
      super(User, datasource.createEntityManager());
   }

   async signUp(signUpDto: SignUpUserDto): Promise<void> {
      const { username, email, password } = signUpDto;
      
      // create a new user
      this.logger.log("creating a new user");
      const newUser = new User();
      newUser.salt = await bcrypt.genSalt();
      newUser.username = username;
      newUser.email = email;
      newUser.createdAt = new Date();
      newUser.password = await this.hashPassword(password, newUser.salt);

      try {
         await newUser.save();
         this.logger.log(`user created with id: ${newUser.id}`)
      } catch (error) {
         if (error.code === "23505") {
            this.logger.error('email already exist')
            throw new ConflictException("There's an account with the same email")
         }
         this.logger.error("threw an error")
         throw new InternalServerErrorException();
      }
   }

   async validateUserPassword(signInDto: SignInUserDto): Promise<string> {
      const { username, password } = signInDto;  
      const user = await this.findOneBy({ username });

      this.logger.log("validating password");
      if (user && await user.validatePassword(password)) {
         this.logger.log("password validated");
         return user.username;
      } else {
         this.logger.warn("couldn't validate password");
         return null;
      }

   }

   async validateUserByUsername(username: string): Promise<User | null> {
      this.logger.log("validating user by username")
      try {
         const user = await this.findOneBy({ username });
         if (user) {
            this.logger.log("user validated");
         } else {
            this.logger.warn("no user found");
         }
         return user || null;
      } catch (error) {
         this.logger.error(`threw error: ${error}`, error.stack);
         throw new UnauthorizedException();
      }
   }

   async hashPassword(password: string, salt: string): Promise<string> {
      this.logger.log("hashing password");
      return await bcrypt.hash(password, salt);
   }
}