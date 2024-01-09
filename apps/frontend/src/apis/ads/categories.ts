import backend from '@/adapters/backend';
import { GetCategoriesResponse } from '@/responses/ads/categories/GetCategoriesResponse';

export function getCategories(signal?: AbortSignal) {
  return backend
    .get(`v1/ads/categories`, { signal })
    .json<GetCategoriesResponse>();
}

export function getCategory(uid: string, signal?: AbortSignal) {
  return backend
    .get(`v1/ads/categories/${uid}`, { signal })
    .json<CategoryResponse>();
}
