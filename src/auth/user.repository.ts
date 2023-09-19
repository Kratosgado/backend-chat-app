import { ConflictException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";

// import { AppDataSource } from "src/config/typeorm.config";
import { User } from "../user/entities/user.entity";
import { AuthCredentialsDto } from "./dto/auth-credentials.dto";
import * as bcrypt from 'bcrypt';
import { DataSource, Repository } from "typeorm";

@Injectable()
export class UsersRepository extends Repository<User> {
   constructor(private datasource: DataSource) {
      super(User, datasource.createEntityManager());
   }

   async signUp(authCredentialsDto: AuthCredentialsDto) : Promise<void> {
      const { username, password } = authCredentialsDto;

      const user = new User();
      user.salt = await bcrypt.genSalt();
      user.username = username;
      user.password = await this.hashPassword(password, user.salt);

      try {
         await user.save();
      } catch (error) {
         if (error.code == "23505") {
            throw new ConflictException('Username already exists')
         }
         throw new InternalServerErrorException();
      }
   }

   async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<string>{
      const { username, password } = authCredentialsDto;
      const user = await this.findOneBy({ username: username });
      
      if (user && await user.validatePassword(password)) {
         return user.username;
      } else {
         return null;
      }
   }

   async validateUserByUsername(username: string): Promise<User | null> {
      try {
         const user = await this.findOneBy({ username: username });
         return user || null
      } catch (error) {
         throw new UnauthorizedException()
      }
   }

   async hashPassword(password: string, salt: string): Promise<string> {
      return await bcrypt.hash(password, salt);
   }
}

// export const UserRepository = AppDataSource.getRepository(User).extend({
//    async signUp(authCredentialsDto: AuthCredentialsDto) : Promise<void> {
//       const { username, password } = authCredentialsDto;

//       const user = new User();
//       user.salt = await bcrypt.genSalt();
//       user.username = username;
//       user.password = await UserRepository.hashPassword(password, user.salt);

//       try {
//          await user.save();
//       } catch (error) {
//          if (error.code == "23505") {
//             throw new ConflictException('Username already exists')
//          }
//          throw new InternalServerErrorException();
//       }
//    },

//    async validateUserPassword(authCredentialsDto: AuthCredentialsDto): Promise<string>{
//       const { username, password } = authCredentialsDto;
//       const user = await UserRepository.findOneBy({ username: username });
      
//       if (user && await user.validatePassword(password)) {
//          return user.username;
//       } else {
//          return null;
//       }
//    },

//    async validateUserByUsername(username: string): Promise<User | null> {
//       try {
//          const user = await UserRepository.findOneBy({ username: username });
//          return user || null
//       } catch (error) {
//          throw new UnauthorizedException()
//       }
//    },

//    async hashPassword(password: string, salt: string): Promise<string> {
//       return await bcrypt.hash(password, salt);
//    }
// })