const { randomUUID } = require('crypto');
const { readFile } = require('fs/promises');
const path = require('path');

/**
 * @typedef {Object} Option
 * @property {string} uid
 * @property {string} name
 */
/**
 * @typedef {Object} Property
 * @property {string} uid
 * @property {string} name
 * @property {Array<Option>} options
 */
/**
 * @typedef {Object} Category
 * @property {string} uid
 * @property {string} name
 * @property {Array<Property>} properties
 */
/**
 * @typedef {Object} StoredRecord
 * @property {number} id
 * @property {string} uid
 */

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  /**
   * @type {Category[]}
   */
  const categories = await readFile(path.resolve(__dirname, 'categories.json'))
    .then((buf) => buf.toString())
    .then((content) => JSON.parse(content))
    .then((categories) => {
      return categories.map((cat) => {
        /** @type {Category} */
        const category = {
          uid: randomUUID(),
          name: cat.name,
          properties: cat.properties.map((prop) => {
            /** @type {Property} */
            const property = {
              uid: randomUUID(),
              name: prop.name,
              options: prop.options.map(function (name) {
                /** @type {Option} */
                const option = {
                  uid: randomUUID(),
                  name: name,
                };

                return option;
              }),
            };

            return property;
          }),
        };

        return category;
      });
    });

  await knex.transaction(async function (trx) {
    /** @type {(StoredRecord & { properties: Property[] })[]} */
    const storedCategories = await trx
      .table('categories')
      .insert(
        categories.map((category) => ({
          uid: trx.fn.uuidToBin(category.uid),
          name: category.name,
        })),
      )
      .then(async ([category_id]) => {
        return await trx
          .table('categories')
          .select('categories.id', 'categories.uid')
          .where('categories.id', '>=', category_id)
          .then((records) =>
            records.map(function (record) {
              const uid = trx.fn.binToUuid(record.uid);
              return {
                id: record.id,
                uid: uid,
                properties: categories.find((cat) => cat.uid === uid)
                  ?.properties,
              };
            }),
          );
      });

    /** @type {(StoredRecord & { options: Option[] })[]} */
    const storedProperties = await trx
      .table('category_properties')
      .insert(
        storedCategories.flatMap(function (record) {
          return record.properties.map((prop) => ({
            uid: trx.fn.uuidToBin(prop.uid),
            name: prop.name,
            category_id: record.id,
          }));
        }),
      )
      .then(([prop_id]) =>
        trx
          .table('category_properties as prop')
          .select('prop.id', 'prop.uid', 'prop.category_id')
          .where('prop.id', '>=', prop_id)
          .then(function (records) {
            return records.map(function (record) {
              const category = storedCategories.find(
                (cat) => cat.id === record.category_id,
              );
              const uid = trx.fn.binToUuid(record.uid);

              return {
                id: record.id,
                uid: uid,
                options: category?.properties.find((prop) => prop.uid === uid)
                  .options,
              };
            });
          }),
      );

    await trx.table('category_property_options').insert(
      storedProperties.flatMap(function (record) {
        return record.options.map(function (option) {
          return {
            uid: trx.fn.uuidToBin(option.uid),
            name: option.name,
            category_property_id: record.id,
          };
        });
      }),
    );
  });
};
