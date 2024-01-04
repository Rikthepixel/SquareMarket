const path = require('node:path');
const { config: configEnv } = require("dotenv")

configEnv();

/**
 * @type {Knex.Config}
 */
const config = {
  client: 'mysql2',
  connection: {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT ?? '0'),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
  },
  migrations: {
    extension: 'js',
    tableName: 'knex_migrations',
    directory: path.join(__dirname, './migrations'),
  },
};

module.exports = config;
