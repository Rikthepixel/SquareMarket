import { z } from 'zod';
import BaseMessage from './BaseMessage';

export const sendMessageMessageSchema = z.object({
  uid: z.string().uuid(),
  chat_uid: z.string().uuid(),
  content: z.string(),
  user: z.object({
    username: z.string(),
    provider_id: z.string()
  }),
  seen_at: z.coerce.date().nullable(),
  sent_at: z.coerce.date(),
});

export default class SendMessageMessage extends BaseMessage<typeof sendMessageMessageSchema> {
  name = 'message_send';
  schema = sendMessageMessageSchema;
}
