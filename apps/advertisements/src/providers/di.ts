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
      'AdvertisementRepository',
      (c) => new KnexAdvertisementRepository(c.resolve('db')),
    )
    .addScoped(
      'AdvertisementService',
      (c) => new AdvertisementService(c.resolve('AdvertisementRepository')),
    );

export default depenencyProvider;
