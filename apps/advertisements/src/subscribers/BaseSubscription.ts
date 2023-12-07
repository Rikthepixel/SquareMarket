import { AckOrNack, BrokerAsPromised } from 'rascal';
import type { Message } from 'amqplib';
import BaseLogger from '../loggers/BaseLogger';
import { z } from 'zod';

type MessageHandler<TSchema extends z.ZodSchema> = (
  content: z.infer<TSchema>,
  ackOrNack: AckOrNack,
  msg: Message,
) => void | Promise<void>;

interface Listener {
  key: string | ((routerKey: string) => boolean);
  schema: z.ZodSchema;
  handler: MessageHandler<z.ZodSchema>;
}

export default class BaseSubscription {
  private listeners: Listener[] = [];
  constructor(
    private broker: BrokerAsPromised,
    private logger: BaseLogger,
  ) {}

  async listen() {
    const session = (await this.broker.subscribe('users_sub'))
      .on('message', (msg, content, ackOrNack) => {
        const listener = this.listeners.find((l) => {
          return (
            (typeof l.key === 'string' && l.key === msg.fields.routingKey) ||
            (typeof l.key === 'function' && l.key(msg.fields.routingKey))
          );
        });

        if (!listener) {
          const err = new Error(
            'Server received message from the message queue that it could not handle',
          );
          this.logger.error(err);
          return ackOrNack(err);
        }

        const result = listener.schema.safeParse(content);
        if (!result.success) {
          const err = new Error(
            'Server received message that had content it did not expect',
          );
          this.logger.error(err);
          return ackOrNack(err);
        }

        try {
          listener.handler(result.data, ackOrNack, msg);
          ackOrNack();
        } catch (err) {
          if (err instanceof Error) {
            this.logger.error(err);
            return ackOrNack(err);
          }
          return ackOrNack(
            new Error('Message consumer encountered an unknown error'),
          );
        }
      })
      .on('error', () => this.logger.error);

    return session;
  }

  register<TSchema extends z.ZodSchema>(
    routeKey: Listener['key'],
    schema: TSchema,
    handler: MessageHandler<TSchema>,
  ) {
    this.listeners.push({
      key: routeKey,
      schema,
      handler: handler as MessageHandler<z.ZodSchema>,
    });
  }
}
