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
  getAdvertisement(uid: string): Promise<void>
}

const useAdvertisements = create<AdvertisementsState>((set, get) => ({
  advertisements: Resource.idle(),
  advertisement: Resource.idle(),

  async getAdvertisementsWithFilter(filter = {}) {
    const advertisements = get().advertisements.abort().reload();
    set({ advertisements });
    set({
      advertisements: await Resource.wrapPromise(
        getFilteredAdvertisements(filter, advertisements.signal()),
      ),
    });
  },

  async getAdvertisement(uid: string) {
    const advertisement = get().advertisement.abort().reload();
    set({ advertisement });
    set({
      advertisement: await Resource.wrapPromise(
        getPublicAdvertisement(uid, advertisement.signal()),
      ),
    });
  }
}));

export default useAdvertisements;
