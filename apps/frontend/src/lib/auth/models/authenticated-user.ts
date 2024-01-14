import { User as Auth0User } from '@auth0/auth0-spa-js';

export default class AuthenticatedUser<TParent extends object> {
  constructor(
    public parent: TParent,
    public username: string,
    public providerId: string,
  ) {}

  public static fromAuth0(user: Auth0User) {
    if (!user.sub) {
      throw new Error('Malformed authenticated user');
    }

    return new AuthenticatedUser(
      user,
      user.name ?? user.nickname ?? 'unknown name',
      user.sub,
    );
  }
}
