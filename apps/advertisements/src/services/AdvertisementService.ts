import Knex from 'knex';

export default class AdvertisementService {
  constructor(private db: Knex.Knex) {

  }

  async getUser() {
    await this.db.table<>('users');
  }
}
