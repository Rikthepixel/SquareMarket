import gateway from 'fast-gateway';
import { config as loadEnv } from 'dotenv';
import { wrapWithCircuitBreaker } from './middleware/circuit-breaker';
import rateLimiter from './middleware/rate-limiter';
import cors from './middleware/cors';
import auth from './middleware/auth';

loadEnv();
const PORT: number = parseInt(process.env.SERVER_PORT ?? '8080');

gateway({
  middlewares: [
    cors({
      credentials: true,
      origin: [
        'http://localhost:5200',
        'http://127.0.0.1:5200',
        'http://localhost:8080',
        'http://127.0.0.1:8080',
      ],
    }),
    auth({
      audience: 'http://localhost:8080',
      issuerBaseURL: 'https://square-market.eu.auth0.com/',
      tokenSigningAlg: 'RS256',
    }),
    rateLimiter({ max: 90 }),
  ],
  routes: wrapWithCircuitBreaker(
    [
      {
        prefix: '/v1/accounts',
        prefixRewrite: '/v1',
        target: process.env.ACCOUNTS_SERVICE_URL ?? 'http://localhost:8001',
      },
    ],
    {
      errorThresholdPercentage: 50,
      timeout: 3 * 1000,
      resetTimeout: 30 * 1000,
    },
  ),
}).start(PORT, '0.0.0.0');
