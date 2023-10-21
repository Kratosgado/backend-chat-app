import { Test, TestingModule } from '@nestjs/testing';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { SignUpInput, User } from './user-utils.input';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';

describe('UserResolver', () => {
  let resolver: UserResolver;

  const user: User[] = [];
  const signUpInputs: SignUpInput[] = [
    {email: "user2@gmail.com", name: "user1", password: "28935617Aa@" },
    {email: "user2@gmail.com", name: "user2", password: "28935617Aa@"},
    {email: "user3@gmail.com", name: "user3", password: "28935617Aa@"}
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserResolver, UserService, PrismaService, JwtService],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
  it('should create a user ', async () => {
    const reposnse = (await resolver.signUp(signUpInputs[0])) as User;
    user.push(reposnse)
    expect(reposnse).toBeInstanceOf(User)
  });

  it('should delete a user from database', async () => {
    expect(await resolver.removeUser(user[0].id)).toBeCalled()
  })
});
