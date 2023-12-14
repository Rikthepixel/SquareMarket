import { SnakeCasedProperties } from 'type-fest';
import Knex from 'knex';
import AdvertisementRepository, {
  DetailedAdvertisement,
  InsertableAdvertisement,
  PublicAdvertisement,
  UserPublishedAdvertisement,
  UserDraftAdvertisement,
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

export default class KnexAdvertisementRepository
  implements AdvertisementRepository
{
  constructor(private db: Knex.Knex) {}

  async get(uidOrId: UidOrId): Promise<DetailedAdvertisement | null> {
    return await this.db.transaction(async (trx) => {
      const ad = await trx
        .table('advertisements as ads')
        .where(
          `ads.${getType(uidOrId)}`,
          castUidOrId(uidOrId, trx.fn.uuidToBin),
        )
        .leftJoin('categories as cat', 'ads.category_id', '=', 'cat.id')
        .select(
          'ads.*',
          'cat.id as category_id',
          'cat.uid as category_uid',
          'cat.name as category_name',
        )
        .first<
          | UidsToBuffers<
              Advertisement & SnakeCasedProperties<Prefix<Category, 'category'>>
            >
          | undefined
        >()
        .then((ad) => {
          if (!ad) return null;
          const { category_id, category_uid, category_name, ...entry } = ad;
          console.log(category_id, category_uid, entry);

          return {
            ...entry,
            uid: trx.fn.binToUuid(entry.uid),
            category: category_uid
              ? {
                  id: category_id,
                  uid: trx.fn.binToUuid(category_uid),
                  name: category_name,
                }
              : null,
          };
        });

      if (!ad) return null;

      const propertyValues = await trx
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
        .select<DetailedAdvertisement['propertyValues']>(
          'vals.uid as uid',
          'props.uid as category_property_uid',
          'opts.uid as category_property_option_uid',
        );

      return {
        ...ad,
        propertyValues,
      } as DetailedAdvertisement;
    });
  }

  async getPublished() {
    return (
      await this.db
        .table('advertisements as ads')
        .whereNotNull('ads.published_at')
        .join('users', 'ads.user_id', '=', 'users.id')
        .join('categories as cat', 'ads.category_id', '=', 'cat.id')
        .select(
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
    ).map<PublicAdvertisement>((entry) => ({
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
    }));
  }

  async getPublishedByUser(userId: number) {
    return (
      await this.db
        .table('advertisements as ads')
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
    ).map<UserPublishedAdvertisement>((entry) => ({
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
    }));
  }

  async getDraftsByUser(userId: number) {
    return (
      await this.db
        .table('advertisements as ads')
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
    ).map<UserDraftAdvertisement>((entry) => ({
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
    }));
  }

  async changeDraftStatus(
    adUidOrId: UidOrId,
    newDraftStatus: boolean,
    publishedAt: Date | null,
  ) {
    this.db
      .table('advertisements as ads')
      .where(`ads.${getType(adUidOrId)}`, adUidOrId)
      .update({ draft: newDraftStatus, published_at: publishedAt });
  }

  async create(ad: InsertableAdvertisement): Promise<void> {
    return this.db.table('advertisements').insert({
      ...ad,
      uid: this.db.fn.uuidToBin(ad.uid),
    });
  }
}
