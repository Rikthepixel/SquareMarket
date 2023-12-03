import ky from 'ky';

import authExtension from '@/lib/auth/adapters/extensions/auth';

const backendUrl = import.meta.env.VITE_BACKEND_URL;
if (typeof backendUrl !== 'string')
  throw new Error('VITE_BACKEND_URL ENV variable is required');

const backend = ky
  .extend(authExtension())
  .extend({ prefixUrl: backendUrl, mode: 'cors', credentials: 'include' })
  .extend({
}).get("/").json()

export default backend;
