import { MaybePromise } from '@/helpers/MaybePromise';
import { Options as KyExtension } from 'ky';
import useAuth from '../../stores/useAuth';

const DEFAULT_GET_TOKEN = () => useAuth.getState().getToken();

export interface AuthExtensionOptions {
  getToken: () => MaybePromise<string | null | undefined>;
}

const authExtension = (
  { getToken }: AuthExtensionOptions = { getToken: DEFAULT_GET_TOKEN },
): KyExtension => {
  return {
    hooks: {
      beforeRequest: [
        async (req) => {
          const token = await getToken();
          if (!token) return;
          req.headers.set('Authorization', `Bearer ${token}`);
        },
      ],
    },
  };
};

export default authExtension;
