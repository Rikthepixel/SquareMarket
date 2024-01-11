import { User } from '../entities/User';
import UserRepository from '../repositories/user/UserRepository';

export interface SyncUserProps {
  provider_id: string;
  username: string;
}

export default class UserService {
  constructor(private userRepository: UserRepository) {}

  async createOrUpdate(props: SyncUserProps) {
    return this.userRepository.createOrUpdate({
      provider_id: props.provider_id,
      username: props.username,
    });
  }
}
