import { User } from '../../entities/User';

export interface CreateUser
  extends Pick<User, 'provider_id' | 'username' | 'default_currency'> {}

export default interface UserRepository {
  get: (providerIdOrId: string | number) => Promise<User | null>;
  create: (user: CreateUser) => Promise<void>;
}
