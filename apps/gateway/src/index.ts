import gateway from 'fast-gateway';
import { config as loadEnv } from 'dotenv';

import { wrapWithCircuitBreaker } from './middleware/circuit-breaker';
import rateLimiter from './middleware/rate-limiter';
import cors from './middleware/cors';

loadEnv();
const PORT: number = parseInt(process.env.SERVER_PORT ?? '8080');

gateway({
  middlewares: [
    cors({
      credentials: true,
      origin: ['http://localhost:5200', 'http://127.0.0.1:5200', "http://localhost:8080", "http://127.0.0.1:8080"]
    }),
    rateLimiter({ max: 90 }),
  ],
  routes: wrapWithCircuitBreaker(
    [
      {
        prefix: '/v1/accounts',
        prefixRewrite: '/v1',
        target: 'http://localhost:8001',
      },
    ],
    {
      errorThresholdPercentage: 50,
      timeout: 3 * 1000,
      resetTimeout: 30 * 1000,
    },
  ),
}).start(PORT, '0.0.0.0');
