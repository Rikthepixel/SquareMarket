import {
  AckOrNack,
  BrokerAsPromised,
  PublicationConfig,
  SubscriptionConfig,
} from 'rascal';
import type { Message } from 'amqplib';
import { z } from 'zod';
import BaseLogger from '../loggers/BaseLogger';

const makeListener =
  (message: BaseMessage) =>
  async (msg: Message, content: unknown, ackOrNack: AckOrNack) => {
    const result = message.schema.safeParse(content);
    if (!result.success) {
      const error = new Error(
        'Message content did not conform to desired data',
      );
      message.logger.error(error);
      return ackOrNack(error);
    }
    await message.onMessage(msg, result.data, ackOrNack);
  };

export default abstract class BaseMessage<
  TSchema extends z.ZodSchema = z.ZodSchema,
> {
  abstract name: string;
  abstract schema: TSchema;

  constructor(
    public broker: BrokerAsPromised,
    public logger: BaseLogger,
  ) {}

  async publish(
    content: z.infer<TSchema>,
    overrides?: PublicationConfig | string,
  ) {
    const session = await this.broker.publish(
      this.name,
      content,
      overrides,
    );
    session.on('error', this.logger.error);
    return session;
  }

  async forward(
    content: z.infer<TSchema>,
    overrides?: PublicationConfig | string,
  ) {
    return await this.broker.forward(this.name, content, overrides);
  }

  abstract onMessage(
    msg: Message,
    content: z.infer<TSchema>,
    ackOrNack: AckOrNack,
  ): void | Promise<void>;

  async listen(overrides?: SubscriptionConfig) {
    const session = await this.broker.subscribe(this.name, overrides);
    session.on('error', this.logger.error);
    session.on('message', makeListener(this));
    return session;
  }
}
