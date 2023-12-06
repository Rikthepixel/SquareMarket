import { withDefaultConfig } from 'rascal';

const brokerConfig = withDefaultConfig({
  vhosts: {
    '/': {
      connection: {
        url: process.env.MQ_CONNECTION_STRING,
      },
      exchanges: {
        accounts_ex: {
          type: 'topic',
        },
      },
      queues: ['accounts_q'],
      bindings: ['accounts_ex[users.*] -> accounts_q'],
      publications: {
        user_created_pub: {
          exchange: 'accounts_ex',
          routingKey: 'users.created',
        },
        user_name_change_pub: {
          exchange: 'accounts_ex',
          routingKey: 'users.name_change',
        },
      },
      subscriptions: {
        users_sub: {
          queue: 'accounts_q',
        },
      },
    },
  },
});

export default brokerConfig;
