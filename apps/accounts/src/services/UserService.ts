import { User } from '../entities/User';
import ProfileAlreadyCompleteException from '../exceptions/self/ProfileAlreadyComplete';
import UserRepository from '../repositories/user/UserRepository';
import CreateUserMessage from '../messages/user/CreateUserMessage';

export interface FinishProfileProps
  extends Pick<User, 'username' | 'default_currency'> {}

export default class UserService {
  constructor(
    private userRepository: UserRepository,
    private createUserMessage: CreateUserMessage,
  ) {}

  async getProfileStatus(providerId: string) {
    const user = await this.userRepository.get(providerId);
    if (!user) return 'setup-required' as const;
    return 'complete' as const;
  }

  async finishProfileSetup(providerId: string, props: FinishProfileProps) {
    const status = await this.getProfileStatus(providerId);
    if (status === 'complete') {
      throw new ProfileAlreadyCompleteException();
    }

    const userToInsert = {
      provider_id: providerId,
      username: props.username,
      default_currency: props.default_currency,
    } as const;

    await this.createUserMessage.publish(userToInsert);
    // await this.userRepository.create(userToInsert);
  }
}
