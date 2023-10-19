import { Resolver, Query, Mutation, Args, Int, ID } from '@nestjs/graphql';
import { UserService } from './user.service';
import { UpdateUserInput, CreateUserInput, User, GetManyUsersInput } from './user-utils.input';
import { Prisma } from '@prisma/client';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Mutation(() => User,)
  createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
    return this.userService.createUser(createUserInput);
  }

  @Query(() => [User], { name: 'users' })
  findAll(@Args('getManyUsersInput') getManyUsersInput?: GetManyUsersInput) {
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
