import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpUserDto } from './dto/signup-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './user.repository';
import { JwtService } from '@nestjs/jwt';
import { SignInUserDto } from './dto/signin-user.dto';
import { JwtPayload } from './jwt-payload.interface';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService
  ) { }
  
  signUp(signUpDto: SignUpUserDto): Promise<User>{
    return this.userRepository.signUp(signUpDto);
  }

  async signIn(signInDto: SignInUserDto): Promise<{accessToken: string}> {
    const username = await this.userRepository.validateUserPassword(signInDto);
    if (!username) {
      throw new UnauthorizedException("Invalid credentials");
    }
    
    const payload: JwtPayload = { username}
    const accessToken = this.jwtService.sign(payload);

    return { accessToken };
  }

  validateUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.validateUserByUsername(username);
  }

  async getUsers(): Promise<User[]> {
    // retrieve all users without their password and salt
    const users = (await this.userRepository.find()).flatMap((user) => {
      delete user.password;
      delete user.salt;
      return user
    })
    
    return users;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
