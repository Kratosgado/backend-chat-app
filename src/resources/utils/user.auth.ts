import { MiddlewareConsumer, ExecutionContext, Injectable, UnauthorizedException, createParamDecorator, Type } from "@nestjs/common";
import { AuthGuard, PassportStrategy } from '@nestjs/passport'

import { Strategy, ExtractJwt } from 'passport-jwt'
import { UserService } from "../../user/user.service";
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { AuthService } from "../../auth/auth.service";

@Injectable()
export class JwtAuthGaurd extends AuthGuard('jwt') { }

export interface JwtPayload {
   email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
   constructor(private readonly authService: AuthService) {
      super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         secretOrKey: process.env.JWTSECRET
      });
   }

   async validate(payload: JwtPayload) {
      console.log("payload", payload);
      const user = await this.authService.validateUserByEmail(payload.email);
      if (!user) return new UnauthorizedException();
      console.log(`validated user: ${user.id}`)
      return user;
   }
}

