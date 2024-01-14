import { Chat } from '../../entities/Chat';
import { Message } from '../../entities/Message';
import { User } from '../../entities/User';

export interface ChatWithUsersAndMessages
  extends Omit<Chat, 'user_0_id' | 'user_1_id'> {
  users: User[];
  messages: (Omit<Message, "from_user_id"> & { username: string })[]
}

export default interface ChatRepository {
  get(uid: string): Promise<ChatWithUsersAndMessages | null>;
}
