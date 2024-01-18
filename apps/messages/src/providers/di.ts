import Knex from 'knex';
import ConsoleLogger from '../loggers/ConsoleLogger';
import IoCContainer from 'tioc';
import { createBrokerAsPromised } from 'rascal';
import dbConfig from '../configs/db';
import authConfig from '../configs/auth';
import brokerConfig from '../configs/broker';
import auth from '../middleware/auth';
import KnexUserRepository from '../repositories/user/KnexUserRepository';
import UserService from '../services/UserService';
import UsersSubscription from '../subscribers/UsersSubscription';
import KnexChatRepository from '../repositories/chat/KnexChatRepository';
import KnexMesssageRepository from '../repositories/message/KnexMessageRepository';
import ChatService from '../services/ChatService';
import MessagesSubscription from '../subscribers/MessagesSubscription';
import SendMessageMessage from '../messages/SendMessageMessage';

const depenencyProvider = (c: IoCContainer) =>
  c
    .addSingleton('db', () => Knex(dbConfig))
    .addSingleton(
      'broker',
      async () => await createBrokerAsPromised(brokerConfig),
    )
    .addSingleton('logger', () => new ConsoleLogger())
    .addScoped('authMiddleware', () => auth(authConfig))
    .addScoped('wsAuthMiddleware', () =>
      auth({
        ...authConfig,
        getToken(ctx) {
          const query = ctx.request.query;
          return 'token' in query && !Array.isArray(query.token)
            ? query.token ?? null
            : null;
        },
      }),
    )
    .addScoped(
      'SendMessageMessage',
      async (c) =>
        new SendMessageMessage(await c.resolve('broker'), c.resolve('logger')),
    )
    .addScoped(
      'UserRespository',
      (c) => new KnexUserRepository(c.resolve('db')),
    )
    .addScoped('ChatRepository', (c) => new KnexChatRepository(c.resolve('db')))
    .addScoped(
      'MessageRepository',
      (c) => new KnexMesssageRepository(c.resolve('db')),
    )
    .addScoped(
      'UserService',
      (c) => new UserService(c.resolve('UserRespository')),
    )
    .addScoped(
      'ChatService',
      async (c) =>
        new ChatService(
          c.resolve('ChatRepository'),
          c.resolve('MessageRepository'),
          c.resolve('UserRespository'),
          await c.resolve('SendMessageMessage'),
        ),
    )
    .addSingleton(
      'MessagesSubscription',
      async (c) =>
        new MessagesSubscription(
          await c.resolve('broker'),
          c.resolve('logger'),
        ),
    )
    .addSingleton(
      'UsersSubscription',
      async (c) =>
        new UsersSubscription(
          await c.resolve('broker'),
          c.resolve('logger'),
          c.resolve('UserService'),
        ),
    );

export default depenencyProvider;
