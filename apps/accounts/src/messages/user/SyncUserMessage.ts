import { z } from 'zod';
import BaseMessage from '../BaseMessage';

const schema = z.object({
  provider_id: z.string(),
  username: z.string(),
  default_currency: z.string(),
});

export default class SyncUserMessage extends BaseMessage<typeof schema> {
  name = 'user_sync';
  schema = schema;
}
