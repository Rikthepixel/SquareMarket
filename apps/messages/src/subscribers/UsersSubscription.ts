import { BrokerAsPromised } from 'rascal';
import BaseLogger from '../loggers/BaseLogger';
import BaseSubscription from './BaseSubscription';
import { z } from 'zod';
import UserService from '../services/UserService';

export default class UsersSubscription extends BaseSubscription {
  constructor(
    broker: BrokerAsPromised,
    logger: BaseLogger,
    userService: UserService,
  ) {
    super(broker, logger);

    this.register(
      (key) => key.endsWith('sync'),
      z.object({
        provider_id: z.string(),
        username: z.string(),
        default_currency: z.string(),
      }),
      async (content, ack) => {
        await userService.createOrUpdate({
          provider_id: content.provider_id,
          username: content.username,
        });
        ack();
      },
    );
  }
}
