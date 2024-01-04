import { Auth0Client } from '@auth0/auth0-spa-js';
import useAuth from './stores/useAuth';
import AuthenticatedUser from './models/authenticated-user';
import SessionCache from './cache/session';

export const auth = new Auth0Client({
  cache: new SessionCache(),
  domain: import.meta.env.VITE_AUTH_DOMAIN_URL,
  clientId: import.meta.env.VITE_AUTH_CLIENT_ID,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: import.meta.env.VITE_BACKEND_URL,
  },
});

window.addEventListener('load', async () => {
  const params = new URLSearchParams(window.location.search);
  if (params.has('state') && params.has('code')) {
    await auth
      .handleRedirectCallback()
      .then(({ appState }) => {
        window.history.replaceState(
          {},
          document.title,
          appState?.returnTo || window.location.pathname,
        );
      })
      .catch(() => null);
  }

  const user = await auth.getUser();
  useAuth.setState({
    loaded: true,
    user: user ? AuthenticatedUser.fromAuth0(user) : null,
  });
});
