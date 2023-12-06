import IoCContainer from 'tioc';

import Knex from 'knex';
import ConsoleLogger from '../loggers/ConsoleLogger';
import AdvertisementService from '../services/AdvertisementService';
import KnexAdvertisementRepository from '../repositories/advertisement/KnexAdvertisementRepository';

const depenencyProvider = (c: IoCContainer) =>
  c
    .addSingleton('db', () =>
      Knex({
        client: 'mysql2',
        connection: {
          host: process.env.DATABASE_HOST,
          port: parseInt(process.env.DATABASE_PORT ?? '0'),
          database: process.env.DATABASE_NAME,
          user: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
        },
      }),
    )
    .addSingleton('logger', () => new ConsoleLogger())
    .addScoped(
      'AdvertisementRepository',
      (c) => new KnexAdvertisementRepository(c.resolve('db')),
    )
    .addScoped(
      'AdvertisementService',
      (c) => new AdvertisementService(c.resolve('AdvertisementRepository')),
    );

export default depenencyProvider;
