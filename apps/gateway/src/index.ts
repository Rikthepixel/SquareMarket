import gateway from 'fast-gateway';
import { config as loadEnv } from 'dotenv';
import { wrapWithCircuitBreaker } from './middleware/circuit-breaker';
import rateLimiter from './middleware/rate-limiter';
import cors from './middleware/cors';
import auth, { wrapWithAuth } from './middleware/auth';
import { AuthOptions } from 'express-oauth2-jwt-bearer';

loadEnv();
const PORT: number = parseInt(process.env.SERVER_PORT ?? '8080');
const AUTH_CONFIG: AuthOptions = {
  audience: 'http://localhost:8080',
  issuerBaseURL: 'https://square-market.eu.auth0.com/',
  tokenSigningAlg: 'RS256',
}

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
    rateLimiter({ max: 90 }),
  ],
  routes: wrapWithCircuitBreaker(
    [
      ...wrapWithAuth([
        {
          prefix: '/v1/accounts',
          prefixRewrite: '/v1',
          target: process.env.ACCOUNTS_SERVICE_URL ?? 'http://localhost:8001',
        }
      ], AUTH_CONFIG)
    ],
    {
      errorThresholdPercentage: 50,
      timeout: 3 * 1000,
      resetTimeout: 30 * 1000,
    },
  ),
}).start(PORT, '0.0.0.0');
