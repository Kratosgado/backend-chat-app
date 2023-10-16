import { Injectable } from "@nestjs/common";
import { PrismaService } from "./prisma.service";
import { Prisma, User } from "@prisma/client";

interface GetManyDto {
   skip?: number;
   take?: number;
   cursor?: Prisma.UserWhereUniqueInput;
   where?: Prisma.UserWhereInput;
   orderBy?: Prisma.UserOrderByWithRelationInput;
}

@Injectable()
export class UserService {
   constructor(private prisma: PrismaService) { }
   
   async user(id: Prisma.UserWhereUniqueInput): Promise<User | null> {
      return await this.prisma.user.findUnique({
         where: id
      });
   }

   async users(getManyDto: GetManyDto): Promise<User[]> {
      // const { skip, take, cursor, where, orderBy } = getManyDto;
      return await this.prisma.user.findMany(getManyDto);
   }
}