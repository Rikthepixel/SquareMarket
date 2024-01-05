import gateway from 'fast-gateway';
import { config as loadEnv } from 'dotenv';

import rateLimiter from './middleware/rate-limiter';
import cors from './middleware/cors';
import { wrapWithCircuitBreaker } from './middleware/circuit-breaker';
import { wrapWithAuth, AuthOptions } from './middleware/auth';
import requestLogger from './middleware/requestLogger';

loadEnv();
const PORT: number = parseInt(process.env.SERVER_PORT ?? '8080');
const AUTH_CONFIG: AuthOptions = {
  audience: process.env.AUTH_AUDIENCE || 'http://localhost:8080',
  issuerBaseURL:
    process.env.AUTH_ISSUER_URL || 'https://square-market.eu.auth0.com',
  tokenSigningAlg: 'RS256',
};

const SERVICES = {
  accounts: process.env.ACCOUNTS_SERVICE_URL ?? 'http://localhost:8001',
  ads: process.env.ADVERTISEMENTS_SERVICE_URL ?? 'http://localhost:8002',
} as const;

gateway({
  middlewares: [
    requestLogger(),
    cors({
      credentials: true,
      origin: [
        process.env.ALLOWED_ORIGIN,
        'http://localhost:5200',
        'http://127.0.0.1:5200',
        'http://localhost:8080',
        'http://127.0.0.1:8080',
      ],
    }),
    rateLimiter({ max: 90 }),
  ],
  routes: wrapWithCircuitBreaker(
    [
      /**
       * For short-circuited authentication add routes here that can be quickly denied access to
       *
       * Specific endpoints cannot be proxied, only the sub-endpoints, e.g. prefix: /v1/ads/health doesn't work
       */
      ...wrapWithAuth(
        [
          {
            prefix: '/v1/accounts/self',
            prefixRewrite: '/v1/self',
            target: SERVICES.accounts,
          },
          {
            prefix: '/v1/ads/manage',
            prefixRewrite: '/v1/manage',
            target: SERVICES.ads,
          },
        ],
        AUTH_CONFIG,
      ),
      {
        prefix: '/v1/ads',
        prefixRewrite: '/v1',
        target: SERVICES.ads,
      },
      {
        prefix: '/v1/ads/images',
        prefixRewrite: '/v1/images',
        target: SERVICES.ads,
      },
      {
        prefix: '/v1/accounts',
        prefixRewrite: '/v1',
        target: SERVICES.accounts,
      },
    ],
    {},
  ),
}).start(PORT, '0.0.0.0');
console.log(`Starting gateway on ${PORT}`);
