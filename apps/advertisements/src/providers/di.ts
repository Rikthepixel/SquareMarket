import IoCContainer from 'tioc';

import Knex from 'knex';
import ConsoleLogger from '../loggers/ConsoleLogger';
import AdvertisementService from '../services/AdvertisementService';


const depenencyProvider = (c: IoCContainer) =>
  c
    .addSingleton('db', () =>
      Knex({
        client: 'mysql2',
        connection: {
          host: process.env.DATABASE_HOST,
          port: parseInt(process.env.DATABASE_PORT ?? "0"),
          database: process.env.DATABASE_NAME,
          user: process.env.DATABASE_USER,
          password: process.env.DATABASE_PASSWORD,
        },
      }),
    )
    .addSingleton('logger', () => new ConsoleLogger())
    .addScoped(
      'AdvertisementService',
      (c) => new AdvertisementService(c.resolve('db')),
    );

export default depenencyProvider;
