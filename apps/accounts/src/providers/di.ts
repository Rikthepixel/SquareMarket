import Knex from 'knex';
import ConsoleLogger from '../loggers/ConsoleLogger';
import IoCContainer from 'tioc';
import auth from '../middleware/auth';
import KnexUserRepository from '../repositories/user/KnexUserRepository';
import UserService from '../services/UserService';
import { createBrokerAsPromised } from 'rascal';
import dbConfig from '../configs/db';
import authConfig from '../configs/auth';
import brokerConfig from '../configs/broker';
import CreateUserMessage from '../messages/user/CreateUserMessage';

const depenencyProvider = (c: IoCContainer) =>
  c
    .addSingleton('logger', () => new ConsoleLogger())
    .addSingleton('db', () => Knex(dbConfig))
    .addSingleton('broker', async (c) =>
      (await createBrokerAsPromised(brokerConfig)).on(
        'error',
        c.resolve('logger').error,
      ),
    )
    .addScoped('authMiddleware', () => auth(authConfig))
    .addScoped('UserRepository', (c) => new KnexUserRepository(c.resolve('db')))
    .addSingleton(
      'CreateUserMessage',
      async (c) =>
        new CreateUserMessage(await c.resolve('broker'), c.resolve('logger')),
    )
    .addScoped(
      'UserService',
      async (c) =>
        new UserService(
          c.resolve('UserRepository'),
          await c.resolve('CreateUserMessage'),
        ),
    );

export default depenencyProvider;
