const path = require("node:path");
// Update with your config settings.

const connection = {
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_NAME,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
};

/**
 * @type {Knex.MigratorConfig}
 */
const migrations = {
  extension: 'ts',
  tableName: 'knex_migrations',
  directory: path.join(__dirname, './migrations'),
};

/**
 * @type {Record<string, Knex.Config>}
 */
const config = {
  development: {
    client: 'mysql2',
    connection,
    migrations,
  },

  production: {
    client: 'mysql2',
    connection,
    pool: {
      min: 2,
      max: 10,
    },
    migrations
  },
};

module.exports = config;
