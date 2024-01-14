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
      .first<User | null>('users.id', 'users.provider_id', 'users.username');
  }

  async getMultiple(uidsOrIds: (string | number)[]): Promise<User[]> {
    const uids = uidsOrIds.filter(
      (uidOrId) => typeof uidOrId !== 'number',
    ) as string[];
    const ids = uidsOrIds.filter(
      (uidOrId) => typeof uidOrId === 'number',
    ) as number[];

    return await this.db
      .table('users')
      .whereIn('users.id', ids)
      .orWhereIn('users.provider_id', uids)
      .select<User[]>('users.id', 'users.provider_id', 'users.username');
  }

  async createOrUpdate(user: InsertableUser) {
    await this.db
      .insert(user)
      .into('users')
      .onConflict(['provider_id'])
      .merge(['username']);
  }
}
