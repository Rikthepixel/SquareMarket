import {
  BrokerAsPromised,
  PublicationConfig,
} from 'rascal';
import { z } from 'zod';
import BaseLogger from '../loggers/BaseLogger';

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
}
