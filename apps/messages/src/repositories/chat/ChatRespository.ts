import { Chat } from '../../entities/Chat';
import { Message } from '../../entities/Message';
import { User } from '../../entities/User';

export interface ChatWithUsersAndMessages
  extends Omit<Chat, 'user_1_id' | 'user_2_id'> {
  users: User[];
  messages: (Omit<Message, 'from_user_id'> & {
    user: { username: string; provider_id: string };
  })[];
}

export interface ChatWithUsers extends Omit<Chat, 'user_1_id' | 'user_2_id'> {
  users: User[];
}

export interface CreatableChat {
  uid: string;
  user_1_id: number;
  user_2_id: number;
}

export default interface ChatRepository {
  get(uid: string): Promise<ChatWithUsersAndMessages | null>;
  getId(uid: string): Promise<number | null>
  getByUser(uid: string): Promise<ChatWithUsers[] | null>;
  create(chat: CreatableChat): Promise<void>;
}
