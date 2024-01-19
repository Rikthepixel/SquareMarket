import { SnakeCasedProperties } from 'type-fest';
import Knex from 'knex';
import AdvertisementRepository, {
  DetailedAdvertisement,
  InsertableAdvertisement,
  PublicAdvertisement,
  UserPublishedAdvertisement,
  UserDraftAdvertisement,
  AdvertisementFilter,
  FilteredAdvertisement,
  UpdatableAdvertisement,
} from './AdvertisementRepository';
import {
  UidOrId,
  castUidOrId,
  getType,
  UidsToBuffers,
} from '../../helpers/identifiers';
import { Advertisement } from '../../entities/Advertisement';
import { Prefix } from '../../types/utility';
import { Category } from '../../entities/Category';
import Image from '../../entities/Image';
import CategoryPropertyOption from '../../entities/CategoryPropertyOption';

export default class KnexAdvertisementRepository
  implements AdvertisementRepository
{
  private table = 'advertisements';
  constructor(private db: Knex.Knex) {}

  async get(uidOrId: UidOrId): Promise<DetailedAdvertisement | null> {
    return await this.db.transaction(async (trx) => {
      const ad = await trx
        .table(this.table + ' as ads')
        .where(
          `ads.${getType(uidOrId)}`,
          castUidOrId(uidOrId, trx.fn.uuidToBin),
        )
        .leftJoin('categories as cat', 'ads.category_id', '=', 'cat.id')
        .leftJoin('users', 'ads.user_id', '=', 'users.id')
        .select(
          'ads.*',
          'users.id as user_id',
          'users.provider_id as user_uid',
          'users.username as user_username',
          'cat.id as category_id',
          'cat.uid as category_uid',
          'cat.name as category_name',
        )
        .first<
          | (UidsToBuffers<
              Advertisement & SnakeCasedProperties<Prefix<Category, 'category'>>
            > & {
              user_id: number;
              user_uid: string;
              user_username: string;
            })
          | undefined
        >()
        .then((ad) => {
          if (!ad) return null;
          const {
            category_id,
            category_uid,
            category_name,
            user_id,
            user_uid,
            user_username,
            ...entry
          } = ad;

          return {
            ...entry,
            uid: trx.fn.binToUuid(entry.uid),
            user_id: user_id,
            category: category_uid
              ? {
                  id: category_id,
                  uid: trx.fn.binToUuid(category_uid),
                  name: category_name,
                }
              : null,
            user: {
              id: user_id,
              uid: user_uid,
              name: user_username,
            },
          };
        });

      if (!ad) return null;

      const imagesTask = trx
        .table('images')
        .where('advertisement_id', ad.id)
        .select<UidsToBuffers<Pick<Image, 'uid'>>[]>('uid')
        .orderBy('id', 'desc')
        .then((imgs) => imgs.map((img) => trx.fn.binToUuid(img.uid)));

      const propertyValuesTask = trx
        .table('category_property_option_values as vals')
        .where('vals.advertisement_id', ad.id)
        .join(
          'category_property_options as opts',
          'vals.category_property_option_id',
          '=',
          'opts.id',
        )
        .join(
          'category_properties as props',
          'opts.category_property_id',
          '=',
          'props.id',
        )
        .select<UidsToBuffers<DetailedAdvertisement['propertyValues']>>(
          'vals.uid as uid',
          'props.uid as category_property_uid',
          'props.name as property_name',
          'opts.uid as category_property_option_uid',
          'opts.name as option_name',
        )
        .then<DetailedAdvertisement['propertyValues']>((vals) =>
          vals.map((val) => ({
            uid: trx.fn.binToUuid(val.uid),
            property_name: val.property_name,
            option_name: val.option_name,
            category_property_uid: trx.fn.binToUuid(val.category_property_uid),
            category_property_option_uid: trx.fn.binToUuid(
              val.category_property_option_uid,
            ),
          })),
        );

      const [images, propertyValues] = await Promise.all([
        imagesTask,
        propertyValuesTask,
      ]);

      return {
        ...ad,
        images,
        propertyValues,
      } as DetailedAdvertisement;
    });
  }

  async getId(uid: string): Promise<number | null> {
    return await this.db
      .table(this.table + ' as ads')
      .where(`ads.uid`, this.db.fn.uuidToBin(uid))
      .select('ads.id')
      .first()
      .then((ad) => {
        if (!ad) return null;
        return ad.id;
      });
  }

  async getFiltered(
    filter: AdvertisementFilter = {},
  ): Promise<FilteredAdvertisement[]> {
    return await this.db.transaction(async (trx) => {
      const category = filter.category;
      const propertyOptions = filter.propertyOptions
        ? [...new Set(filter.propertyOptions)]
        : undefined;

      let query = trx
        .table(this.table + ' as ads')
        .whereNotNull('ads.published_at')
        .select<any[]>('ads.*');

      if (filter.content) {
        query = query.where((q) =>
          q
            .whereILike('ads.title', `%${filter.content}%`)
            .orWhereILike('ads.description', `%${filter.content}%`),
        );
      }

      if (category && propertyOptions && propertyOptions?.length !== 0) {
        const optionGroups = await trx
          .table('category_property_options as opts')
          .whereIn(
            'opts.uid',
            propertyOptions.map((u) => trx.fn.uuidToBin(u)),
          )
          .join(
            'category_properties as props',
            'opts.category_property_id',
            '=',
            'props.id',
          )
          .select<
            UidsToBuffers<
              Pick<CategoryPropertyOption, 'uid' | 'id'> & {
                property_id: number;
              }
            >[]
          >('opts.uid', 'opts.id', 'props.id as property_id')
          .then((opts) =>
            opts.reduce((groups, option) => {
              const optGroup = groups.get(option.property_id) ?? [];
              if (optGroup.length === 0) {
                groups.set(option.property_id, optGroup);
              }
              optGroup.push(option.id);
              return groups;
            }, new Map<number, number[]>()),
          );

        query = query.andWhere((queryAndWhere) =>
          queryAndWhere.whereIn('ads.id', (queryWhereIn) =>
            queryWhereIn
              .table('category_property_option_values as vals')
              .join(
                'category_property_options as opts',
                'vals.category_property_option_id',
                '=',
                'opts.id',
              )
              .where((where) => {
                for (const [, optionGroup] of optionGroups) {
                  where = where.orWhereIn('opts.id', optionGroup);
                }
                return where;
              })
              .join(
                'category_properties as props',
                'opts.category_property_id',
                '=',
                'props.id',
              )
              .join('categories as cat', 'props.category_id', '=', 'cat.id')
              .andWhere('cat.uid', trx.fn.uuidToBin(category))
              .select('vals.advertisement_id'),
          ),
        );
      } else if (category) {
        query = query.andWhere((b) =>
          b.whereIn('ads.category_id', (q) =>
            q
              .table('categories as cat')
              .where('cat.uid', trx.fn.uuidToBin(category))
              .select('cat.id'),
          ),
        );
      }

      const ads = await query;
      const images = await trx
        .table('images as imgs')
        .whereIn(
          'imgs.advertisement_id',
          ads.map((a) => a.id),
        )
        .orderBy('id', 'desc')
        .select<
          UidsToBuffers<Pick<Image, 'id' | 'uid' | 'advertisement_id'>>[]
        >('imgs.id', 'imgs.uid', 'imgs.advertisement_id')
        .then((imgs) =>
          imgs.map((img) => ({
            ...img,
            uid: trx.fn.binToUuid(img.uid),
          })),
        );

      return ads.map((ad) => ({
        uid: trx.fn.binToUuid(ad.uid),
        title: ad.title,
        description: ad.description,
        images: images
          .filter((img) => img.advertisement_id === ad.id)
          .map((img) => img.uid),
        price: ad.price,
        currency: ad.currency,
        published_at: new Date(ad.published_at),
      }));
    });
  }

  async getPublished() {
    return await this.db.transaction(async (trx) => {
      const advertisements = await trx
        .table(this.table + ' as ads')
        .whereNotNull('ads.published_at')
        .join('users', 'ads.user_id', '=', 'users.id')
        .join('categories as cat', 'ads.category_id', '=', 'cat.id')
        .select<any[]>(
          'users.id as seller_id',
          'users.provider_id as seller_provider_id',
          'users.username as seller_name',
          'cat.id as category_id',
          'cat.uid as category_uid',
          'cat.name as category_name',
          'ads.id',
          'ads.uid',
          'ads.title',
          'ads.description',
          'ads.price',
          'ads.currency',
          'ads.published_at',
        )
        .then((ads) =>
          ads.map<Omit<PublicAdvertisement, 'images'>>((entry) => ({
            seller: {
              id: entry.seller_id,
              provider_id: entry.seller_provider_id,
              username: entry.seller_name,
            },
            category: {
              id: entry.category_id,
              uid: this.db.fn.binToUuid(entry.category_uid),
              name: entry.category_name,
            },
            id: entry.id,
            uid: this.db.fn.binToUuid(entry.uid),
            title: entry.title,
            description: entry.description,
            price: entry.price,
            currency: entry.currency,
            published_at: entry.published_at,
          })),
        );

      const images = await trx
        .table('images')
        .whereIn(
          'advertisement_id',
          advertisements.map((ad) => ad.id),
        )
        .orderBy('id', 'desc')
        .select<{ uid: Buffer; advertisement_id: number }[]>(
          'uid',
          'advertisement_id',
        );

      return advertisements.map((ad) => ({
        ...ad,
        images: images
          .filter((img) => img.advertisement_id === ad.id)
          .map((img) => trx.fn.binToUuid(img.uid)),
      }));
    });
  }

  async getPublishedByUser(userId: number) {
    return this.db.transaction(async (trx) => {
      const advertisements = await this.db
        .table(this.table + ' as ads')
        .whereNotNull('ads.published_at')
        .where('ads.user_id', userId)
        .join('categories as cat', 'ads.category_id', '=', 'cat.id')
        .select(
          'cat.id as category_id',
          'cat.uid as category_uid',
          'cat.name as category_name',
          'ads.id',
          'ads.uid',
          'ads.title',
          'ads.description',
          'ads.price',
          'ads.currency',
          'ads.published_at',
        )
        .then((ads) =>
          ads.map<Omit<UserPublishedAdvertisement, 'images'>>((entry) => ({
            category: {
              id: entry.category_id,
              uid: this.db.fn.binToUuid(entry.category_uid),
              name: entry.category_name,
            },
            id: entry.id,
            uid: this.db.fn.binToUuid(entry.uid),
            title: entry.title,
            description: entry.description,
            price: entry.price,
            currency: entry.currency,
            published_at: entry.published_at,
          })),
        );

      const images = await trx
        .table('images')
        .whereIn(
          'advertisement_id',
          advertisements.map((ad) => ad.id),
        )
        .orderBy('id', 'desc')
        .select<{ uid: Buffer; advertisement_id: number }[]>(
          'uid',
          'advertisement_id',
        );

      return advertisements.map((ad) => ({
        ...ad,
        images: images
          .filter((img) => img.advertisement_id === ad.id)
          .map((img) => trx.fn.binToUuid(img.uid)),
      }));
    });
  }

  async getDraftsByUser(userId: number) {
    return this.db.transaction(async (trx) => {
      const advertisements = await this.db
        .table(this.table + ' as ads')
        .whereNull('ads.published_at')
        .where('ads.user_id', userId)
        .leftJoin('categories as cat', 'ads.category_id', '=', 'cat.id')
        .select(
          'cat.id as category_id',
          'cat.uid as category_uid',
          'cat.name as category_name',
          'ads.id',
          'ads.uid',
          'ads.title',
          'ads.description',
          'ads.price',
          'ads.currency',
        )
        .then((ads) =>
          ads.map<Omit<UserDraftAdvertisement, 'images'>>((entry) => ({
            category: entry.category_uid
              ? {
                  id: entry.category_id,
                  uid: this.db.fn.binToUuid(entry.category_uid),
                  name: entry.category_name,
                }
              : null,
            id: entry.id,
            uid: this.db.fn.binToUuid(entry.uid),
            title: entry.title,
            description: entry.description,
            price: entry.price,
            currency: entry.currency,
          })),
        );

      const images = await trx
        .table('images')
        .whereIn(
          'advertisement_id',
          advertisements.map((ad) => ad.id),
        )
        .orderBy('id', 'desc')
        .select<{ uid: Buffer; advertisement_id: number }[]>(
          'uid',
          'advertisement_id',
        );

      return advertisements.map((ad) => ({
        ...ad,
        images: images
          .filter((img) => img.advertisement_id === ad.id)
          .map((img) => trx.fn.binToUuid(img.uid)),
      }));
    });
  }

  async create(ad: InsertableAdvertisement): Promise<void> {
    await this.db.table(this.table).insert({
      ...ad,
      uid: this.db.fn.uuidToBin(ad.uid),
    });
  }

  async update(uidOrId: UidOrId, ad: UpdatableAdvertisement): Promise<void> {
    await this.db
      .table(this.table)
      .where(getType(uidOrId), castUidOrId(uidOrId, this.db.fn.uuidToBin))
      .update(ad);
  }

  async delete(uidOrId: UidOrId): Promise<void> {
    await this.db
      .table(this.table)
      .where(`${getType(uidOrId)}`, castUidOrId(uidOrId, this.db.fn.uuidToBin))
      .delete();
  }
}
