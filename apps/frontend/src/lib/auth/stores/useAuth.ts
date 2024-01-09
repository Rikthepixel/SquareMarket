import { User as Auth0User } from '@auth0/auth0-spa-js';
import { create } from 'zustand';

import { auth } from '../init';
import AuthenticatedUser from '../models/authenticated-user';

interface AuthState {
  user: AuthenticatedUser<Auth0User> | null;
  loaded: boolean;

  getToken: () => Promise<string | null>;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loaded: false,

  async getToken() {
    const user = get().user;
    if (!user) return null;
    return await auth.getTokenSilently();
  },

  async login() {
    await auth.loginWithRedirect();
  },

  async logout() {
    await auth.logout();
    set({ user: null });
  },
}));

export default useAuth;
