import { User as Auth0User } from '@auth0/auth0-spa-js';

export default class AuthenticatedUser<TParent extends Object> {
  constructor(
    public parent: TParent,
    public displayName: string,
  ) {}

  public static fromAuth0(user: Auth0User) {
    return new AuthenticatedUser(
      user,
      user.name ?? user.nickname ?? 'unknown name',
    );
  }
}
