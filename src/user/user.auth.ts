import { MiddlewareConsumer, ExecutionContext, Injectable, UnauthorizedException, createParamDecorator, Type } from "@nestjs/common";
import {AuthGuard, PassportStrategy} from '@nestjs/passport'

import {Strategy, ExtractJwt} from 'passport-jwt'
import { UserService } from "./user.service";
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { Prisma } from "@prisma/client";

@Injectable()
export class AuthMiddleware  {
   resolve(): (socket: Socket, next: (err?: ExtendedError) => void) => void {
      return (socket: Socket, next: (err?: ExtendedError) => void) => {
         
      }
   }
   
}
@Injectable()
export class JwtAuthGaurd extends AuthGuard('jwt') {}

export interface JwtPayload {
   email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
   constructor(private readonly userService: UserService) {
      super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         secretOrKey: process.env.JWTSECRET
      });
   }

   async validate(payload: JwtPayload) {
      console.log("payload", payload);
      const user =  await this.userService.validateUserByEmail(payload.email);
      if (!user) return new UnauthorizedException();
      console.log(`validated user: ${user.id}`)
      return user;
   }
}

export const GetUser = createParamDecorator(
   (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      return request.user
   }
)