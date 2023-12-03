import Knex from 'knex';
import { Advertisement } from '../models/Advertisement';
import { User } from '../models/User';

export default class AdvertisementService {
  constructor(private db: Knex.Knex) {}

  async getPublicAdvertisements() {
    return await this.db
      .table<Advertisement, Advertisement>('advertisements as ads')
      .whereNotNull('ads.published_at')
      .join<Pick<User, 'username'>>('users', 'ads.user_id', '=', 'users.id')
      .select(
        'users.username',
        'ads.uid',
        'ads.title',
        'ads.description',
        'ads.price',
        'ads.currency',
      );
  }
}
