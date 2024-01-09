const backendUrl = import.meta.env.VITE_BACKEND_URL;

if (typeof backendUrl !== 'string')
  throw new Error('VITE_BACKEND_URL ENV variable is required');

export function getImageUrl(uid: string) {
    return `${backendUrl}/v1/ads/images/${uid}`
}
