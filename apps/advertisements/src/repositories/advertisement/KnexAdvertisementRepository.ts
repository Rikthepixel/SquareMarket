import Knex from 'knex';
import AdvertisementRepository, {
  CreateAdvertisement,
  PublicAdvertisement,
  UserAdvertisement,
  UserDraftAdvertisement,
} from './AdvertisementRepository';
import { UidOrId, getType } from '../../helpers/identifiers';

export default class KnexAdvertisementRepository
  implements AdvertisementRepository
{
  constructor(private db: Knex.Knex) {}

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
        uid: entry.category_uid,
        name: entry.category_name,
      },
      id: entry.id,
      uid: entry.uid,
      title: entry.title,
      description: entry.description,
      price: entry.price,
      currency: entry.currency,
      published_at: entry.published_at,
    }));
  }

  async getByUser(userId: number) {
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
    ).map<UserAdvertisement>((entry) => ({
      category: {
        id: entry.category_id,
        uid: entry.category_uid,
        name: entry.category_name,
      },
      id: entry.id,
      uid: entry.uid,
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
        )
    ).map<UserDraftAdvertisement>((entry) => ({
      category: {
        id: entry.category_id,
        uid: entry.category_uid,
        name: entry.category_name,
      },
      id: entry.id,
      uid: entry.uid,
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

  async create(ad: CreateAdvertisement) {
    await this.db.insert(ad);
  }
}
