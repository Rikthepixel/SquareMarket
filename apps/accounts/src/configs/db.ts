import { Knex } from 'knex';

const dbConfig: Knex.Config = {
  client: 'mysql2',
  connection: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '0'),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    ssl: {
      rejectUnauthorized: false,
    },
  },
};

export default dbConfig
