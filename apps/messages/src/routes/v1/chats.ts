import { z } from 'zod';
import makeRouter, { AppRouter } from '../../helpers/router';
import validate from '../../middleware/validate';
import websocket, { WebSocketContext } from 'koa-imp-ws';
import { AuthState } from '../../middleware/auth';
import { chatMessageRequestSchema } from '../../requests/ChatMessageRequest';
import { websocketRequestSchema } from '../../requests/WebsocketRequest';
import EventEmitter from 'events';
import { startChatRequestSchema } from '../../requests/StartChatRequest';

const chatsRouter = makeRouter<object, AuthState>().use((ctx, next) =>
  ctx.container.resolve('authMiddleware')(ctx, next),
);
const wsChatsRouter = makeRouter<WebSocketContext, AuthState>().use(
  (ctx, next) => ctx.container.resolve('wsAuthMiddleware')(ctx, next),
);

chatsRouter.get('Get chats', '/', async (ctx) => {
  const chatService = await ctx.container.resolve('ChatService');
  ctx.status = 200;
  ctx.body = await chatService.getByUser(ctx.state.user.sub);
});

chatsRouter.post(
  'Start chat',
  '/',
  validate({ body: startChatRequestSchema }),
  async (ctx) => {
    const chatService = await ctx.container.resolve('ChatService');
    ctx.status = 200;
    ctx.body = {
      uid: await chatService.startChat(
        ctx.state.user.sub,
        ctx.validated.body.user,
      ),
    };
  },
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
      return ctx.throw(400, 'This is a websocket endpoint');
    }

    const chatService = await ctx.container.resolve('ChatService');
    const chat = await chatService.get(ctx.validated.params.uid);
    const user = chat.users.find((u) => u.provider_id === ctx.state.user.sub);
    if (!user) {
      return ctx.throw(403, 'You are not part of this conversation');
    }

    const sub = await ctx.container.resolve('MessagesSubscription');
    const unSub = sub.onMessage(({ chat_uid, ...message }) => {
      if (
        chat_uid !== chat.uid ||
        message.user.provider_id === user.provider_id
      ) {
        return;
      }

      socket.send(
        JSON.stringify({
          type: 'chat-message',
          ...message,
        }),
      );
    });
    const emitter = new EventEmitter();

    emitter.on('chat-message', async (data) => {
      const request = chatMessageRequestSchema.parse(data);
      const chatService = await ctx.container.resolve('ChatService');

      const message = await chatService.sendMessage(
        chat.uid,
        user.provider_id,
        request.content,
      );

      socket.send(
        JSON.stringify({
          type: 'chat-message',
          ...message,
        }),
      );
    });

    socket.on('message', (message) => {
      const data = JSON.parse(message.toString());
      const wsReq = websocketRequestSchema.parse(data);
      emitter.emit(wsReq.type, data);
    });

    socket.send(
      JSON.stringify({
        type: 'chat-init',
        ...chat,
      }),
    );

    socket.on('close', () => {
      unSub();
    });

    ctx.status = 101;
  },
);

wsChatsRouter.use(chatsRouter.routes());
export default wsChatsRouter as unknown as AppRouter;
