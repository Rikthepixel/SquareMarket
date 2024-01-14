import { Knex } from 'knex';
import ChatRepository, {
  ChatWithUsers,
  ChatWithUsersAndMessages,
  CreatableChat,
} from './ChatRespository';
import { Chat } from '../../entities/Chat';
import { UidsToBuffers } from '../../helpers/identifiers';
import { User } from '../../entities/User';

export default class KnexChatRepository implements ChatRepository {
  constructor(private db: Knex) {}

  async getId(uid: string): Promise<number | null> {
    return await this.db
      .table('chats')
      .select<{ id: number }>('id')
      .where('chats.uid', this.db.fn.uuidToBin(uid))
      .first()
      .then((res) => (!res ? null : res.id));
  }

  async get(uid: string): Promise<ChatWithUsersAndMessages | null> {
    return await this.db.transaction(async function (trx) {
      const chat = await trx
        .table('chats')
        .select<UidsToBuffers<Chat>>('id', 'uid', 'user_1_id', 'user_2_id')
        .where('chats.uid', trx.fn.uuidToBin(uid))
        .first();

      if (!chat) return null;

      const usersTask = trx
        .table('users')
        .select<User[]>('id', 'provider_id', 'username')
        .whereIn('users.id', [chat.user_1_id, chat.user_2_id]);

      const messagesTask = trx
        .table('messages')
        .join('users', 'messages.from_user_id', '=', 'users.id')
        .where('messages.chat_id', chat.id)
        .select(
          'messages.id',
          'messages.uid',
          'messages.chat_id',
          'messages.content',
          'messages.seen_at',
          'messages.sent_at',
          'users.username as user_username',
          'users.provider_id as user_provider_id',
        )
        .then<ChatWithUsersAndMessages['messages']>((msgs) =>
          msgs.map((msg) => ({
            ...msg,
            uid: trx.fn.binToUuid(msg.uid),
            user: {
              username: msg.user_username,
              provider_id: msg.user_provider_id,
            },
          })),
        );

      const [users, messages] = await Promise.all([usersTask, messagesTask]);

      return {
        id: chat.id,
        uid: trx.fn.binToUuid(chat.uid),
        users,
        messages,
      };
    });
  }

  async getByUser(uid: string): Promise<ChatWithUsers[] | null> {
    return await this.db
      .table('chats')
      .join('users as users_1', 'chats.user_1_id', '=', 'users_1.id')
      .join('users as users_2', 'chats.user_2_id', '=', 'users_2.id')
      .where('users_1.provider_id', uid)
      .orWhere('users_2.provider_id', uid)
      .select(
        'chats.id',
        'chats.uid',
        'chats.user_1_id',
        'users_1.username as user_1_username',
        'users_1.provider_id as user_1_provider_id',
        'chats.user_2_id',
        'users_2.username as user_2_username',
        'users_2.provider_id as user_2_provider_id',
      )
      .then((chats) => {
        return chats.map((chat) => ({
          ...chat,
          uid: this.db.fn.binToUuid(chat.uid),
          users: [
            {
              id: chat.user_1_id,
              provider_id: chat.user_1_provider_id,
              username: chat.user_1_username,
            },
            {
              id: chat.user_2_id,
              provider_id: chat.user_2_provider_id,
              username: chat.user_2_username,
            },
          ],
        }));
      });
  }

  create(chat: CreatableChat): Promise<void> {
    return this.db.table('chats').insert({
      uid: this.db.fn.uuidToBin(chat.uid),
      user_1_id: chat.user_1_id,
      user_2_id: chat.user_2_id,
    });
  }
}
