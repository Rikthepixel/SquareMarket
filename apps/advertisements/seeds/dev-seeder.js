const { log } = require('console');
const { randomUUID } = require('crypto');

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
exports.seed = async function (knex) {
  await knex.transaction(async function (trx) {
    /**
     * @type {import("../src/entities/User").User}
     */
    const user = {
      provider_id: 'auth0|655608efef7ac688b2c73ae5',
      username: 'Rik den Breejen',
      default_currency: 'EUR',
    };
    const [user_id] = await trx('users').insert(user);

    /**
     * @type {import("../src/entities/Category").Category}
     */
    const category = {
      uid: knex.fn.uuidToBin(randomUUID()),
      name: 'Computers',
    };
    const [category_id] = await trx('categories').insert(category);

    const properties = [
      {
        uid: knex.fn.uuidToBin(randomUUID()),
        category_id: category_id,
        name: 'Processor',
        options: ['Intel i3', 'Intel i5', 'Intel i7', 'Intel i9'],
      },
      {
        uid: knex.fn.uuidToBin(randomUUID()),
        category_id: category_id,
        name: 'Brand',
        options: ['Dell', 'HP', 'Lenovo', 'Custom'],
      },
      {
        uid: knex.fn.uuidToBin(randomUUID()),
        category_id: category_id,
        name: 'Storage Type',
        options: ['SSD', 'HDD', 'SSD + HDD'],
      },
      {
        uid: knex.fn.uuidToBin(randomUUID()),
        category_id: category_id,
        name: 'Storage',
        options: ['256GB', '512GB', '1TB', '2TB'],
      },
      {
        uid: knex.fn.uuidToBin(randomUUID()),
        category_id: category_id,
        name: 'Memory (RAM)',
        options: ['2GB', '4GB', '8GB', '16GB', '32GB'],
      },
    ];

    const propIds = await trx('category_properties')
      .insert(
        properties.map((p) => ({
          uid: p.uid,
          name: p.name,
          category_id: p.category_id,
        })),
      )
      .then(([firstPropId]) =>
        trx('category_properties as prop')
          .select('prop.id', 'prop.uid')
          .where('prop.id', '>=', firstPropId),
      );

    const options = propIds
      .map(({ id, uid }) => {
        const prop = properties.find((p) => p.uid.compare(uid) === 0);
        if (!prop.options) return [];
        return prop.options.map((name) => ({
          uid: trx.fn.uuidToBin(randomUUID()),
          category_property_id: id,
          name,
        }));
      })
      .flatMap((ol) => ol);

    await trx('category_property_options')
      .insert(options)
      .then(([firstOptId]) =>
        trx('category_property_options as opt')
          .select('opt.id', 'opt.uid', 'opt.name', 'opt.category_property_id')
          .where('opt.id', '>=', firstOptId),
      );
  });
};
