import backend from '@/adapters/backend';
import { PutAdvertisementRequest } from '@/requests/ads/PutAdvertisementRequest';
import { CreateAdvertisementResponse } from '@/responses/ads/manage/CreateAdvertisementResponse';
import { GetAdvertisementResponse } from '@/responses/ads/manage/GetAdvertisementResponse';
import { GetDraftAdvertisementsResponse } from '@/responses/ads/manage/GetDraftAdvertisementsResponse';
import { GetPublishedAdvertisementsResponse } from '@/responses/ads/manage/GetPublishedAdvertisementsResponse';

export async function getAdvertisement(uid: string, signal?: AbortSignal) {
  return await backend
    .get(`v1/ads/manage/${uid}`, { signal })
    .then(async (kyResponse) => {
      const response = await kyResponse.json<GetAdvertisementResponse>();
      response.draft = Boolean(response.draft);
      return response;
    });
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

export async function putAdvertisement(
  uid: string,
  request: PutAdvertisementRequest,
) {
  return await backend.put(`v1/ads/manage/${uid}`, {
    json: request,
  });
}

export async function uploadAdvertisementImage(uid: string, images: File[]) {
  const request = new FormData();
  for (const image of images) {
    request.append('image', image);
  }

  return await backend
    .post(`v1/ads/manage/${uid}/images`, {
      body: request,
    })
    .json<string[]>();
}
