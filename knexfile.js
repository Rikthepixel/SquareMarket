const path = require("node:path");
const { config: configEnv } = require("dotenv");

const environments = ["advertisements", "accounts"];

const config = Object.fromEntries(
  environments
    .map((environment) => {
      const envPath = path.join(__dirname, "apps", environment);

      const prodEnvVariables = {};
      const localEnvVariables = {};

      configEnv({
        path: path.join(envPath, ".env"),
        processEnv: prodEnvVariables,
      });
      configEnv({
        path: path.join(envPath, ".env"),
        processEnv: localEnvVariables,
      });
      configEnv({
        path: path.join(envPath, ".env.local"),
        processEnv: localEnvVariables,
        override: true,
      });
      configEnv({
        path: path.join(envPath, ".env.production"),
        processEnv: prodEnvVariables,
        override: true,
      });

      /** @type {import("knex").Knex.MigratorConfig} */
      const migrations = {
        extension: "js",
        tableName: "knex_migrations",
        directory: path.join(envPath, "migrations"),
      };

      /** @type {import("knex").Knex.SeederConfig} */
      const seeds = {
        extension: "js",
        directory: path.join(envPath, "seeds"),
      };

      /** @type {import("knex").Knex.Config} */
      const development = {
        client: "mysql2",
        connection: {
          host: localEnvVariables.DATABASE_HOST,
          port: parseInt(localEnvVariables.DATABASE_PORT ?? "0"),
          database: localEnvVariables.DATABASE_NAME,
          user: localEnvVariables.DATABASE_USER,
          password: localEnvVariables.DATABASE_PASSWORD,
        },
        migrations,
        seeds
      };

      /** @type {import("knex").Knex.Config} */
      const production = {
        client: "mysql2",
        connection: {
          host: prodEnvVariables.DATABASE_HOST,
          port: parseInt(prodEnvVariables.DATABASE_PORT ?? "0"),
          database: prodEnvVariables.DATABASE_NAME,
          user: prodEnvVariables.DATABASE_USER,
          password: prodEnvVariables.DATABASE_PASSWORD,
          ssl: {
            rejectUnauthorized: false,
          },
        },
        migrations,
        seeds
      };

      return [
        [`${environment}-production`, production],
        [`${environment}-development`, development],
      ];
    })
    .flatMap((v) => v),
);

module.exports = config;
