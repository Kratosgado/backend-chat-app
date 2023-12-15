import { MiddlewareConsumer, ExecutionContext, Injectable, UnauthorizedException, createParamDecorator, Type, CanActivate, Logger } from "@nestjs/common";
import { AuthGuard, PassportStrategy } from '@nestjs/passport'

import { Strategy, ExtractJwt, JwtFromRequestFunction } from 'passport-jwt'
import { UserService } from "../../user/user.service";
import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { AuthService } from "../../auth/auth.service";

export interface JwtPayload {
   email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
   private readonly logger = new Logger(JwtStrategy.name);

   constructor(private readonly authService: AuthService) {
      super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         secretOrKey: process.env.JWTSECRET
      });
   }

   async validate(payload: JwtPayload) {
      const user = await this.authService.validateUserByEmail(payload.email);
      if (!user) return new UnauthorizedException();
      this.logger.log(`validated user: ${user.username}`)
      return user;
   }
}