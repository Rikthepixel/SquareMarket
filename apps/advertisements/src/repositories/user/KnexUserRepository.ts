import Knex from 'knex';
import UserRepository, { InsertableUser } from './UserRepository';
import { User } from '../../entities/User';

export default class KnexUserRepository implements UserRepository {
  constructor(private db: Knex.Knex) {}

  async get(providerIdOrId: number | string) {
    return await this.db
      .table('users')
      .where(
        `users.${typeof providerIdOrId === 'number' ? 'id' : 'provider_id'}`,
        providerIdOrId,
      )
      .first<User | null>(
        'users.id',
        'users.provider_id',
        'users.username',
        'users.default_currency',
      );
  }

  async createOrUpdate(user: InsertableUser) {
    await this.db
      .insert(user)
      .into('users')
      .onConflict(['provider_id'])
      .merge(['username', 'default_currency']);
  }
}
