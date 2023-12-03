const { randomUUID } = require('crypto');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
  /**
   * @type { import("../src/models/User").User }
   */
  const user = {
    uid: knex.fn.uuidToBin(randomUUID()),
    username: 'test user',
    default_currency: 'EUR',
  };
  const [user_id] = await knex('users').insert(user).returning('id');

  /**
   * @type { import("../src/models/Category").Category }
   */
  const category = {
    uid: knex.fn.uuidToBin(randomUUID()),
    name: 'Phones',
  };
  const [category_id] = await knex('categories').insert(category).returning('id');

  /**
   * @type { import("../src/models/Advertisement").Advertisement[] }
   */
  const ads = [
    {
      uid: knex.fn.uuidToBin(randomUUID()),
      user_id,
      category_id,
      title: 'Samsung S22',
      price: 450.0,
      currency: 'EUR',
      description: 'A Samsung',
      published_at: new Date(),
      draft: false,
    },
    {
      uid: knex.fn.uuidToBin(randomUUID()),
      user_id,
      category_id,
      title: 'Iphone 12',
      price: 400.0,
      currency: 'EUR',
      description: 'An Iphone',
      draft: true,
    },
  ];
  await knex('advertisements').insert(ads);
};
