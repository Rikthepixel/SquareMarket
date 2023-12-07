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
      (key) => key.endsWith('create'),
      z.object({
        provider_id: z.string(),
        username: z.string(),
        default_currency: z.string(),
      }),
      (content, ack) => {
        userService.create({
          provider_id: content.provider_id,
          username: content.username,
          default_currency: content.default_currency,
        });
        ack()
      },
    );
  }
}
