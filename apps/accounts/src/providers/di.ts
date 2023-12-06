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

const depenencyProvider = (c: IoCContainer) =>
  c
    .addSingleton('db', () => Knex(dbConfig))
    .addSingleton('broker', async () => await createBrokerAsPromised(brokerConfig))
    .addSingleton('logger', () => new ConsoleLogger())
    .addScoped('authMiddleware', () => auth(authConfig))
    .addScoped('UserRepository', (c) => new KnexUserRepository(c.resolve('db')))
    .addScoped(
      'UserService',
      async (c) =>
        new UserService(c.resolve('UserRepository'), await c.resolve('broker')),
    );

export default depenencyProvider;
