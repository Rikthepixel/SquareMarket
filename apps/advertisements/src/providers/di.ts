import IoCContainer from 'tioc';

import Knex from 'knex';
import ConsoleLogger from '../loggers/ConsoleLogger';

const depenencyProvider = (c: IoCContainer) =>
  c
    .addSingleton('db', () => Knex({}))
    .addSingleton('logger', () => new ConsoleLogger())

export default depenencyProvider;
