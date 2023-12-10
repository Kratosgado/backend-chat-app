import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Socket } from "socket.io";

export const SocketUser = createParamDecorator(
   (data: unknown, ctx: ExecutionContext) => {
      const request = ctx.switchToWs().getClient<Socket>().data;
      return request.user
   }
);