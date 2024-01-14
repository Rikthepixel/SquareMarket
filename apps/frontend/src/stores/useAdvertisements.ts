import { getFilteredAdvertisements, getPublicAdvertisement } from '@/apis/ads';
import Resource from '@/helpers/Resource';
import { PublicAdvertisementResponse } from '@/responses/ads/PublicAdvertisementResponse';
import { create } from 'zustand';

interface Advertisement {
  uid: string;
  title: string;
  description: string;
  images: string[];
  price: number;
  currency: string;
  published_at: Date;
}

interface SearchFilter {
  search?: string;
  category?: string;
  property_options?: string[];
}

interface AdvertisementsState {
  advertisements: Resource<Advertisement[]>;
  advertisement: Resource<PublicAdvertisementResponse>;

  getAdvertisementsWithFilter(filter: SearchFilter): Promise<void>;
  getAdvertisement(uid: string): Promise<void>;
}

const useAdvertisements = create<AdvertisementsState>((set, get) => ({
  advertisements: Resource.idle(),
  advertisement: Resource.idle(),

  async getAdvertisementsWithFilter(filter = {}) {
    const resource = get().advertisements.abort().reload();
    set({ advertisements: resource });
    Resource.wrapPromise(
      getFilteredAdvertisements(filter, resource.signal()),
    ).then((res) => set({ advertisements: res }));
  },

  async getAdvertisement(uid: string) {
    const resource = get().advertisement.abort().reload();
    set({ advertisement: resource });
    Resource.wrapPromise(getPublicAdvertisement(uid, resource.signal())).then(
      (res) => set({ advertisement: res }),
    );
  },
}));

export default useAdvertisements;
