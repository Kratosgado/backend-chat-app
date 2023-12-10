import { Injectable, Logger, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";
import { Socket } from "socket.io";
import { JwtPayload } from "../utils/auth.strategy";
import { AuthService } from "src/auth/auth.service";
import { PrismaService } from "src/prisma.service";

@Injectable()
export class SocketGuard extends AuthGuard('jwt') {
   private readonly logger = new Logger(SocketGuard.name);
   private readonly jwtService = new JwtService();
   private readonly authService: AuthService = new AuthService(new PrismaService, this.jwtService);


   async canActivate(context: ExecutionContext) {
      try {
         const client = context.switchToWs().getClient<Socket>();
         if (client.handshake.headers.authorization) {
            const bearerToken = client.handshake.headers.authorization.split(" ")[1];
            const payload = this.jwtService.verify(bearerToken, { secret: process.env.JWTSECRET })
            const user = await this.validate(payload);

            context.switchToWs().getClient<Socket>().data.user = user;
         }
         return true;
      } catch (error) {
         this.logger.error(error);
         return false;
      }
   }
   async validate(payload: JwtPayload) {
      const user = await this.authService.validateUserByEmail(payload.email);
      if (!user) throw new UnauthorizedException();
      this.logger.log(`validated user: ${user.username}`)
      return user;
   }
}