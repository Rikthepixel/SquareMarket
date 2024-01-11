import Koa from 'koa';
import JwksRsa from 'jwks-rsa';
import jwt from 'koa-jwt';

export interface AuthOptions {
  issuerUrl: string;
  audience: string;
}

interface DecodedJwt {
  iss: string;
  /** Same as ProviderId */
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  azp: string;
  scope: string;
}

export interface AuthState {
  user: DecodedJwt;
}

export default function auth({
  issuerUrl,
  audience,
}: AuthOptions): Koa.Middleware<AuthState> {
  const middleware = jwt({
    secret: JwksRsa.koaJwtSecret({
      cache: true,
      rateLimit: true,
      jwksRequestsPerMinute: 5,
      jwksUri: `${issuerUrl}.well-known/jwks.json`,
    }),
    audience,
    issuer: issuerUrl,
    algorithms: ['RS256'],
  });

  return middleware;
}
