import { Injectable, Logger, ExecutionContext } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { Socket } from "socket.io";

@Injectable()
export class SocketGuard extends AuthGuard('jwt') {
   private readonly logger = new Logger(SocketGuard.name);

   canActivate(context: ExecutionContext) {
      try {
         const client = context.switchToWs().getClient<Socket>();
         if (client.handshake.headers.authorization) {
            const bearerToken = client.handshake.headers.authorization;
            context.switchToHttp().getRequest<Request>().headers["authorization"] = bearerToken
         }
         return true;
      } catch (error) {
         this.logger.error(error);
         return false;
      }
   }
   }