import { Knex } from 'knex';
import ChatRepository, { ChatWithUsersAndMessages } from './ChatRespository';
import { Chat } from '../../entities/Chat';
import { UidsToBuffers } from '../../helpers/identifiers';
import { User } from '../../entities/User';

export default class KnexChatRepository implements ChatRepository {
  constructor(private db: Knex) {}

  async get(uid: string): Promise<ChatWithUsersAndMessages | null> {
    return await this.db.transaction(async function (trx) {
      const chat = await trx
        .table('chats')
        .select<UidsToBuffers<Chat>>('id', 'uid', 'user_0_id', 'user_1_id')
        .where('chats.uid', trx.fn.uuidToBin(uid))
        .first();

      if (!chat) return null;

      const usersTask = trx
        .table('users')
        .select<User[]>('id', 'provider_id', 'username')
        .whereIn('users.uid', [chat.user_0_id, chat.user_1_id]);

      const messagesTask = trx
        .table('messages')
        .join('users', 'messages.from_user_id', '=', 'users.id')
        .where('messages.chat_id', chat.id)
        .select<UidsToBuffers<ChatWithUsersAndMessages['messages']>>(
          'messages.id',
          'messages.uid',
          'messages.chat_id',
          'messages.content',
          'messages.seen_at',
          'messages.sent_at',
          'users.username as username',
        )
        .then((msgs) =>
          msgs.map((msg) => ({ ...msg, uid: trx.fn.binToUuid(msg.uid) })),
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
}
