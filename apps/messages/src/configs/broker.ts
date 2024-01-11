import { withDefaultConfig } from 'rascal';

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
      },
      queues: ['messages_user_queue'],
      bindings: {
        'accounts_ex-accounts_queue': {
          source: 'accounts_ex',
          destination: 'messages_user_queue',
          destinationType: 'queue',
          bindingKey: 'users.*',
        },
      },
      publications: {},
      subscriptions: {
        users_sub: {
          queue: 'messages_user_queue',
        },
      },
    },
  },
});

export default brokerConfig;
