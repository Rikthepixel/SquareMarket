import { Message } from 'amqplib';
import { AckOrNack } from 'rascal';
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

  onMessage(
    msg: Message,
    content: z.infer<typeof this.schema>,
    ackOrNack: AckOrNack,
  ) {
    console.log(msg, content);
    ackOrNack();
  }
}
