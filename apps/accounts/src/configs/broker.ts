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
        user_sync: {
          exchange: 'accounts_ex',
          routingKey: 'users.sync',
        },
      },
      subscriptions: {},
    },
  },
});

export default brokerConfig;
