import { ExecutionContext, Injectable, UnauthorizedException, createParamDecorator } from "@nestjs/common";
import {AuthGuard, PassportStrategy} from '@nestjs/passport'

import {Strategy, ExtractJwt} from 'passport-jwt'
import { UserService } from "./user.service";
import { GqlExecutionContext } from "@nestjs/graphql";

@Injectable()
export class JwtAuthGaurd extends AuthGuard('jwt') { }

export interface JwtPayload {
   username: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
   constructor(private readonly userService: UserService) {
      super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         secretOrKey: process.env.JWT_SECRET || "kratos28935617"
      });
   }

   async validate(payload: JwtPayload) {
      const user = this.userService.validateToken(payload.username);
      if (!user) return new UnauthorizedException();
      return user;
   }
}

export const GetUser = createParamDecorator(
   (data: unknown, ctx: ExecutionContext) => {
      const request = GqlExecutionContext.create(ctx).getContext();
      return request.user
   }
)