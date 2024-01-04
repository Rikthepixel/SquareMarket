/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await exports.down(knex);
  /**
   * @param {import("knex").Knex.AlterTableBuilder} table
   */
  await knex.schema.createTable('users', function (table) {
    table.increments('id');
    table.string('provider_id', 500).unique().index();
    table.string('username', 255);
    table.string('default_currency', 3);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema.dropTableIfExists('users');
};
