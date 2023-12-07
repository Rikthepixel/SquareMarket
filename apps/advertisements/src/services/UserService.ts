import { User } from '../entities/User';
import UserRepository from '../repositories/user/UserRepository';

export interface SyncUserProps
  extends Pick<User, 'provider_id' | 'username' | 'default_currency'> {}

export default class UserService {
  constructor(private userRepository: UserRepository) {}

  async createOrUpdate(props: SyncUserProps) {
    return this.userRepository.createOrUpdate({
      provider_id: props.provider_id,
      username: props.username,
      default_currency: props.default_currency,
    });
  }
}
