import backend from '@/adapters/backend';
import { FilteredAdvertisementsRequest } from '@/requests/ads/FilteredAdvertisementsRequest';
import { FilteredAdvertisementsResponse } from '@/responses/ads/FilteredAdvertisementsResponse';
import { PublicAdvertisementResponse } from '@/responses/ads/PublicAdvertisementResponse';

export async function getFilteredAdvertisements(
  request: FilteredAdvertisementsRequest,
  signal?: AbortSignal,
): Promise<FilteredAdvertisementsResponse> {
  const params = new URLSearchParams();

  if (request.search) {
    params.append('search', request.search);
  }

  if (request.category) {
    params.append('cat', request.category);
  }

  if (request.property_options) {
    for (const option of request.property_options) {
      params.append('po', option);
    }
  }

  const ads = await backend
    .get(`v1/ads/filter?${params.toString()}`, { signal })
    .json();

  if (!Array.isArray(ads)) throw Error('ResponseParseFailure');

  return ads.map((ad) => ({
    ...ad,
    published_at: new Date(ad.published_at),
  }));
}

export async function getPublicAdvertisement(
  uid: string,
  signal?: AbortSignal,
) {
  return await backend
    .get(`v1/ads/${uid}`, { signal })
    .json<any>()
    .then<PublicAdvertisementResponse>((ad) => ({
      ...ad,
      published_at: new Date(ad.published_at),
    }));
}
