import { z } from 'zod';
import BaseMessage from '../BaseMessage';

const schema = z.object({
  provider_id: z.string(),
  username: z.string(),
  default_currency: z.string(),
});

export default class CreateUserMessage extends BaseMessage<typeof schema> {
  name = 'user_create';
  schema = schema;
}
