import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  function addIds(table: Knex.AlterTableBuilder) {
    table.increments('id');
    table
      .uuid('uid', {
        useBinaryUuid: true,
      })
      .unique()
      .index();
  }

  await knex.schema
    .table('users', function (table) {
      addIds(table);
      table.string('username', 255);
      table.string('default_currency', 3);
    })
    .table('categories', function (table) {
      addIds(table);
      table.string('name', 255);
    })
    .table('category_properties', function (table) {
      addIds(table);
      table.string('name', 255);
      table
        .integer('category_id')
        .unsigned()
        .references('categories.id')
        .onDelete('cascade');
    })
    .table('category_property_options', function (table) {
      addIds(table);
      table
        .integer('category_property_id')
        .unsigned()
        .references('category_properties.id')
        .onDelete('cascade');
      table.string('name', 255);
    })
    .table('advertisements', function (table) {
      addIds(table);
      table
        .integer('user_id')
        .unsigned()
        .references('users.id')
        .onDelete('cascade');
      table
        .integer('category_id')
        .unsigned()
        .references('categories.id')
        .onDelete('cascade');
      table.string('title', 255);
      table.text('description');
      table.decimal('price', 10, 2);
      table.string('currency', 3);
      table.boolean('draft').defaultTo(true);
      table.datetime('published_at', { useTz: true }).nullable();
    })
    .table('category_property_option_values', function (table) {
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
        .onDelete('cascade');
    })
    .table('category_property_values', function (table) {
      addIds(table);
      table
        .integer('advertisement_id')
        .unsigned()
        .references('advertisements.id')
        .onDelete('cascade');
      table
        .integer('category_property_id')
        .unsigned()
        .references('category_properties.id')
        .onDelete('cascade');
      table.string('value', 255);
    })
    .table('images', function (table) {
      addIds(table);
      table.integer('advertisement_id').unsigned();
      table.foreign('advertisement_id').references('advertisements.id');
      table.string('path', 255);
      table.string('ext', 10);
    });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema
    .dropTable('images')
    .dropTable('category_property_values')
    .dropTable('category_property_option_values')
    .dropTable('advertisements')
    .dropTable('category_property_options')
    .dropTable('category_properties')
    .dropTable('categories')
    .dropTable('users');
}
