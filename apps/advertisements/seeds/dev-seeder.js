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
      provider_id: randomUUID(),
      username: 'test user',
      default_currency: 'EUR',
    };
    const [user_id] = await trx('users').insert(user);

    /**
     * @type {import("../src/entities/Category").Category}
     */
    const category = {
      uid: knex.fn.uuidToBin(randomUUID()),
      name: 'Phones',
    };
    const [category_id] = await trx('categories').insert(category);

    const properties = [
      {
        uid: knex.fn.uuidToBin(randomUUID()),
        category_id: category_id,
        name: 'Brand',
        options: ['Samsung', 'Apple', 'OnePlus', 'Oppo'],
      },
      {
        uid: knex.fn.uuidToBin(randomUUID()),
        category_id: category_id,
        name: 'Storage',
        options: ['32GB', '64GB', '128GB', '256GB'],
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

    const optionIds = await trx('category_property_options')
      .insert(options)
      .then(([firstOptId]) =>
        trx('category_property_options as opt')
          .select('opt.id', 'opt.uid', 'opt.category_property_id')
          .where('opt.id', '>=', firstOptId),
      );

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

        propValues: [
          {
            propId: propIds[0].id,
            optId: optionIds.find(
              (opt) => opt.category_property_id === propIds[0].id,
            ).id,
          },
          {
            propId: propIds[1].id,
            optId: optionIds.find(
              (opt) => opt.category_property_id === propIds[1].id,
            ).id,
          },
        ],
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

        propValues: [
          {
            propId: propIds[0].id,
            optId: optionIds.find(
              (opt) => opt.category_property_id === propIds[0].id,
            ).id,
          },
          {
            propId: propIds[1].id,
            optId: optionIds.find(
              (opt) => opt.category_property_id === propIds[1].id,
            ).id,
          },
        ],
      },
    ];

    const adIds = await trx('advertisements')
      .insert(ads.map(({ propValues: _propValues, ...ad }) => ({ ...ad })))
      .then(([firstAdId]) =>
        trx('advertisements as ads')
          .select('ads.id', 'ads.uid')
          .where('ads.id', '>=', firstAdId),
      );

    const optValues = adIds
      .map(({ id, uid }) => {
        const ad = ads.find((ad) => ad.uid.compare(uid) === 0);
        return ad.propValues.map(({ optId }) => ({
          uid: trx.fn.uuidToBin(randomUUID()),
          // category_property_id: propId,
          category_property_option_id: optId,
          advertisement_id: id,
        }));
      })
      .flatMap((v) => v);

    await trx('category_property_option_values').insert(optValues);
  });
};
