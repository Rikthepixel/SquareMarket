import type { Knex } from 'knex';

// Update with your config settings.

const connection = {
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
};

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql',
    connection,
    migrations: {
      extension: 'ts',
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'mysql',
    connection,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      extension: 'ts',
      tableName: 'knex_migrations',
    },
  },
};

module.exports = config;
