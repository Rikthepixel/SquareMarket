import Knex from 'knex';
import ConsoleLogger from '../loggers/ConsoleLogger';
import IoCContainer from 'tioc';
import { createBrokerAsPromised } from 'rascal';
import dbConfig from '../configs/db';
import authConfig from '../configs/auth';
import brokerConfig from '../configs/broker';
import KnexAdvertisementRepository from '../repositories/advertisement/KnexAdvertisementRepository';
import AdvertisementService from '../services/AdvertisementService';
import auth from '../middleware/auth';
import KnexUserRepository from '../repositories/user/KnexUserRepository';
import UserService from '../services/UserService';
import UsersSubscription from '../subscribers/UsersSubscription';

const depenencyProvider = (c: IoCContainer) =>
  c
    .addSingleton('db', () => Knex(dbConfig))
    .addSingleton(
      'broker',
      async () => await createBrokerAsPromised(brokerConfig),
    )
    .addSingleton('logger', () => new ConsoleLogger())
    .addScoped('authMiddleware', () => auth(authConfig))
    .addScoped(
      'UserRespository',
      (c) => new KnexUserRepository(c.resolve('db')),
    )
    .addScoped(
      'UserService',
      (c) => new UserService(c.resolve('UserRespository')),
    )
    .addScoped(
      'AdvertisementRepository',
      (c) => new KnexAdvertisementRepository(c.resolve('db')),
    )
    .addScoped(
      'AdvertisementService',
      (c) => new AdvertisementService(c.resolve('AdvertisementRepository')),
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
