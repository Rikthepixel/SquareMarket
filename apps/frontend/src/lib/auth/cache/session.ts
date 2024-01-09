import { Cacheable, ICache, MaybePromise } from "@auth0/auth0-spa-js";

const CACHE_KEY_PREFIX = '@@auth0spajs@@';

/**
 * Auth0 sessionStorage cache. The application persists the auth-state in the sessionStorage.
 */
export default class SessionCache implements ICache {
  public set<T = Cacheable>(key: string, entry: T) {
    sessionStorage.setItem(key, JSON.stringify(entry));
  }

  public get<T = Cacheable>(key: string): MaybePromise<T | undefined> {
    const json = window.sessionStorage.getItem(key);

    if (!json) return;

    try {
      const payload = JSON.parse(json) as T;
      return payload;
    } catch (e) {
      return;
    }
  }

  public remove(key: string) {
    sessionStorage.removeItem(key);
  }

  public allKeys() {
    return Object.keys(window.sessionStorage).filter(key =>
      key.startsWith(CACHE_KEY_PREFIX)
    );
  }}
