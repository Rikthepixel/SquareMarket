/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function (knex) {
  await exports.down(knex);
  /**
   * @param {import("knex").Knex.AlterTableBuilder} table
   */
  function addIds(table) {
    table.increments('id');
    table
      .uuid('uid', {
        useBinaryUuid: true,
      })
      .unique()
      .index();
  }

  await knex.schema
    .createTable('users', function (table) {
      table.increments('id');
      table.string('provider_id', 500).unique().index();
      table.string('username', 255);
    })
    .createTable('chats', function (table) {
      addIds(table);
      table
        .integer('user_1_id')
        .unsigned()
        .references('users.id')
        .onDelete('cascade');
      table
        .integer('user_2_id')
        .unsigned()
        .references('users.id')
        .onDelete('cascade');
    })
    .createTable('messages', function (table) {
      addIds(table);
      table
        .integer('from_user_id')
        .unsigned()
        .references('users.id')
        .onDelete('cascade');
      table
        .integer('chat_id')
        .unsigned()
        .references('chats.id')
        .onDelete('cascade');
      table.text('content');
      table.date('seen_at').nullable();
      table.date('sent_at');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema
    .dropTableIfExists('messages')
    .dropTableIfExists('chats')
    .dropTableIfExists('users');
};
