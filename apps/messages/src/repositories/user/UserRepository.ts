import { User } from '../../entities/User';

export interface InsertableUser
  extends Pick<User, 'provider_id' | 'username'> {}

export default interface UserRepository {
  get: (providerIdOrId: string | number) => Promise<User | null>;
  getMultiple(uidsOrIds: (string | number)[]): Promise<User[]>;
  createOrUpdate: (user: InsertableUser) => Promise<void>;
}
