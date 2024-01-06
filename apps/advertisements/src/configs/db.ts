import { Knex } from 'knex';

const dbConfig: Knex.Config = {
  client: 'mysql2',
  connection: {
    connectString: process.env.DATABASE_CONNECTION_STRING,
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '0'),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
};

export default dbConfig
