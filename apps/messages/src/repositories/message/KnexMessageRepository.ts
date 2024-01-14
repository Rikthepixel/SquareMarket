import { Knex } from 'knex';
import MessageRepository, { CreatableMessage } from './MessageRepository';

export default class KnexMessageRepository implements MessageRepository {
  constructor(private db: Knex) {}

  async create(msg: CreatableMessage): Promise<void> {
    return this.db.table('messages').insert({
      uid: this.db.fn.uuidToBin(msg.uid),
      content: msg.content,
      from_user_id: msg.from_user_id,
      chat_id: msg.chat_id,
      seen_at: null,
      sent_at: msg.sent_at,
    });
  }
}
