import { z } from 'zod';
import makeRouter, { AppRouter } from '../../helpers/router';
import validate from '../../middleware/validate';
import websocket, { WebSocketContext } from 'koa-imp-ws';
import { AuthState } from '../../middleware/auth';

const wsChatsRouter = makeRouter<WebSocketContext, AuthState>().use(
  (ctx, next) => ctx.container.resolve('wsAuthMiddleware')(ctx, next),
);

wsChatsRouter.get(
  'Connect to chat',
  '/:uid',
  validate({
    params: z.object({ uid: z.string().uuid() }),
    query: z.object({ token: z.string() }),
  }),
  websocket(),
  async (ctx) => {
    const socket = await ctx.ws();

    if (!socket) {
      ctx.status = 400;
      ctx.body = 'User must request websocket connection';
      return;
    }

    const chatService = ctx.container.resolve("ChatService")
    const chat = await chatService.get(ctx.validated.params.uid)
    chat.users

    // socket.on('message', function (data) {
    //   if (data === "init") {
    //
    //   }
    // });
  },
);

export default wsChatsRouter as unknown as AppRouter;
