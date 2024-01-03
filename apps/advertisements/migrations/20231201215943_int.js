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
      table.string('default_currency', 3);
    })
    .createTable('categories', function (table) {
      addIds(table);
      table.string('name', 255);
    })
    .createTable('category_properties', function (table) {
      addIds(table);
      table.string('name', 255);
      table
        .integer('category_id')
        .unsigned()
        .references('categories.id')
        .onDelete('cascade');
    })
    .createTable('category_property_options', function (table) {
      addIds(table);
      table
        .integer('category_property_id')
        .unsigned()
        .references('category_properties.id')
        .onDelete('cascade');
      table.string('name', 255);
    })
    .createTable('advertisements', function (table) {
      addIds(table);
      table
        .integer('user_id')
        .unsigned()
        .references('users.id')
        .onDelete('cascade');
      table
        .integer('category_id')
        .unsigned()
        .nullable()
        .references('categories.id')
        .onDelete('cascade');
      table.string('title', 255).nullable();
      table.text('description').nullable();
      table.decimal('price', 10, 2).nullable();
      table.string('currency', 3).nullable();
      table.boolean('draft').defaultTo(true);
      table.datetime('published_at', { useTz: true }).nullable();
    })
    .createTable('category_property_option_values', function (table) {
      addIds(table);

      table
        .integer('advertisement_id')
        .unsigned()
        .references('advertisements.id')
        .onDelete('cascade');

      table
        .integer('category_property_option_id')
        .unsigned()
        .references('category_property_options.id')
        .withKeyName('cat_prop_opt_value_to_cat_prop_opt')
        .onDelete('cascade');
    })
    .createTable('images', function (table) {
      addIds(table);
      table
        .integer('advertisement_id')
        .unsigned()
        .references('advertisements.id')
      table.string('mime', 255);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function (knex) {
  await knex.schema
    .dropTableIfExists('images')
    .dropTableIfExists('category_property_option_values')
    .dropTableIfExists('advertisements')
    .dropTableIfExists('category_property_options')
    .dropTableIfExists('category_properties')
    .dropTableIfExists('categories')
    .dropTableIfExists('users');
};
