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
      queues: [],
      bindings: {},
      publications: {
        user_create: {
          exchange: 'accounts_ex',
          routingKey: 'users.create',
        },
        user_name_change: {
          exchange: 'accounts_ex',
          routingKey: 'users.name_change',
        },
      },
      subscriptions: {},
    },
  },
});

export default brokerConfig;
