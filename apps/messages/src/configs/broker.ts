import { randomUUID } from 'crypto';
import { withDefaultConfig } from 'rascal';

const uid = randomUUID();

const brokerConfig = withDefaultConfig({
  vhosts: {
    '/': {
      connection: {
        url: process.env.MQ_CONNECTION_STRING,
      },
      exchanges: {
        accounts_ex: {
          assert: true,
          type: 'topic',
        },
        messages_ex: {
          assert: true,
          type: 'topic',
        },
      },
      queues: {
        messages_user_queue: {},
        ['messages_message_queue' + uid]: {
          options: {
            durable: false,
            exclusive: true,
          },
        },
      },
      bindings: {
        'accounts_ex-accounts_queue': {
          source: 'accounts_ex',
          destination: 'messages_user_queue',
          destinationType: 'queue',
          bindingKey: 'users.*',
        },
        'messages_ex-message_queue': {
          source: 'messages_ex',
          destination: 'messages_message_queue' + uid,
          destinationType: 'queue',
          bindingKey: 'chats.messages.*',
        },
      },
      publications: {
        message_send: {
          exchange: 'messages_ex',
          routingKey: 'chats.messages.send',
        },
      },
      subscriptions: {
        users_sub: {
          queue: 'messages_user_queue',
        },
        messages_sub: {
          queue: 'messages_message_queue' + uid,
        },
      },
    },
  },
});

export default brokerConfig;
