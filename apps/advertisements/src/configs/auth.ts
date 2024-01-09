import { AuthOptions } from '../middleware/auth';

const authConfig: AuthOptions = {
  audience: process.env.AUTH_AUDIENCE || 'http://localhost:8080',
  issuerUrl:
    process.env.AUTH_ISSUER_URL || 'https://square-market.eu.auth0.com/',
};

export default authConfig;
