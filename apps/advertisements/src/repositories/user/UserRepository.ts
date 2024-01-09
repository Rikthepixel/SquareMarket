import { User } from '../../entities/User';

export interface InsertableUser
  extends Pick<User, 'provider_id' | 'username' | 'default_currency'> {}

export default interface UserRepository {
  get: (providerIdOrId: string | number) => Promise<User | null>;
  createOrUpdate: (user: InsertableUser) => Promise<void>;
}
