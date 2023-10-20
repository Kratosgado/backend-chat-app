import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UpdateUserInput, SignUpInput, User, GetManyUsersInput, SignInInput } from './user-utils.input';
import { Prisma } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User,)
  signUp(@Args('signUpInput') signUpInput: SignUpInput) {
    return this.userService.signUp(signUpInput);
  }

  @Mutation(() => String)
  signIn(@Args('signInInput') signInInput: SignInInput) {
    return this.userService.signIn(signInInput);
  }

  @Query(() => [User], { name: 'users' })
  findAll(@Args('getManyUsersInput', {nullable: true}) getManyUsersInput?: GetManyUsersInput) {
    return this.userService.users(getManyUsersInput);
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.userService.user({id});
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.userService.updateUser(updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => ID }) id: string) {
    return this.userService.deleteUser({id});
  }
}
