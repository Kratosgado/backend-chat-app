import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, createParamDecorator } from "@nestjs/common";
import {AuthGuard, PassportStrategy} from '@nestjs/passport'

import {Strategy, ExtractJwt} from 'passport-jwt'
import { UserService } from "./user.service";
import { GqlExecutionContext } from "@nestjs/graphql";
import { Observable } from "rxjs";

@Injectable()
export class JwtAuthGaurd extends AuthGuard('jwt') {
   getRequest(context: ExecutionContext) {
      const ctx = GqlExecutionContext.create(context);
      return ctx.getContext().req;
   }
}


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
      const user =  await this.userService.validateUserByEmail(payload.email);
      if (!user) return new UnauthorizedException();
      console.log(`validated user: ${user.id}`)
      return user;
   }
}

export const GetUser = createParamDecorator(
   (data: unknown, ctx: ExecutionContext) => {
      const request = GqlExecutionContext.create(ctx).getContext().req;
      return request.user
   }
)