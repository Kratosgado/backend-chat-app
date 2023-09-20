import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import {Strategy, ExtractJwt} from 'passport-jwt'
import { UserService } from "./user.service";
import * as config from 'config';
import { JwtPayload } from "./jwt-payload.interface";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
   constructor(private readonly userService: UserService) {
      super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         secretOrKey: config.get('jwt.secret'),
      });
   }

   async validate(payload: JwtPayload) {
      const user = await this.userService.validateUserByUsername(payload.username);

      if (!user) {
         throw new UnauthorizedException();
      }

      return user;
   }
}