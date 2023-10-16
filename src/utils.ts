import { Prisma } from "@prisma/client";

export type GetManyDto = {
   skip?: number;
   take?: number;
   cursor?: Prisma.UserWhereUniqueInput;
   where?: Prisma.UserWhereInput;
   orderBy?: Prisma.UserOrderByWithRelationInput;
}

export type UpdateUser = {
   where: Prisma.UserWhereUniqueInput;
   data: Prisma.UserUpdateInput
}