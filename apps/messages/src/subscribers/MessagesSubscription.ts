import { BrokerAsPromised } from 'rascal';
import BaseLogger from '../loggers/BaseLogger';
import BaseSubscription  from './BaseSubscription';
import { sendMessageMessageSchema } from '../messages/SendMessageMessage';
import { z } from 'zod';

type OnMessageHandler = (
  content: z.infer<typeof sendMessageMessageSchema>,
) => Promise<void> | void;

export default class MessagesSubscription extends BaseSubscription {
  public name = 'messages_sub';
  private onMessageHandlers: OnMessageHandler[] = [];

  constructor(broker: BrokerAsPromised, logger: BaseLogger) {
    super(broker, logger);

    this.register(
      (key) => key.endsWith('.send'),
      sendMessageMessageSchema,
      async (content) => {
        const tasks = this.onMessageHandlers.map(async (handler) => await handler(content));
        await Promise.all(tasks)
      },
    );
  }

  onMessage(handler: OnMessageHandler) {
    this.onMessageHandlers.push(handler);
    return () => {
      const index = this.onMessageHandlers.indexOf(handler);
      if (index === -1) return;
      this.onMessageHandlers.splice(index, 1);
    };
  }
}
