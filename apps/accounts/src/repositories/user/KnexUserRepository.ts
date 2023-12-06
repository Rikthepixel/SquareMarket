import Knex from 'knex';
import UserRepository, { CreateUser } from './UserRepository';
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

  async create(user: CreateUser) {
    await this.db.insert(user).into('users');
  }
}
