import { User } from '../entities/User';
import UserRepository from '../repositories/user/UserRepository';

export interface CreateUserProps
  extends Pick<User, 'provider_id' | 'username' | 'default_currency'> {}

export default class UserService {
  constructor(private userRepository: UserRepository) {}

  async create(props: CreateUserProps) {
    this.userRepository.create({
      provider_id: props.provider_id,
      username: props.username,
      default_currency: props.default_currency,
    });
  }
}
