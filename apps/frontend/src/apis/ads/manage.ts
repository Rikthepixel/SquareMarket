import backend from '@/adapters/backend';
import { CreateAdvertisementResponse } from '@/responses/ads/manage/CreateAdvertisementResponse';
import { GetAdvertisementResponse } from '@/responses/ads/manage/GetAdvertisementResponse';
import { GetDraftAdvertisementsResponse } from '@/responses/ads/manage/GetDraftAdvertisementsResponse';
import { GetPublishedAdvertisementsResponse } from '@/responses/ads/manage/GetPublishedAdvertisementsResponse';

export function getAdvertisement(uid: string, signal?: AbortSignal) {
  return backend
    .get(`v1/ads/manage/${uid}`, { signal })
    .json<GetAdvertisementResponse>();
}

export async function getPublishedAdvertisements(
  signal?: AbortSignal,
): Promise<GetPublishedAdvertisementsResponse> {
  const ads = await backend.get('v1/ads/manage/published', { signal }).json();
  if (!Array.isArray(ads)) throw Error('ResponseParseFailure');
  return ads.map((ad) => ({
    ...ad,
    published_at: new Date(ad.published_at),
  }));
}

export async function getDraftAdvertisements(signal?: AbortSignal) {
  return await backend
    .get('v1/ads/manage/drafts', { signal })
    .json<GetDraftAdvertisementsResponse>();
}

export async function createAdvertisement() {
  return await backend
    .post('v1/ads/manage/create')
    .json<CreateAdvertisementResponse>();
}
