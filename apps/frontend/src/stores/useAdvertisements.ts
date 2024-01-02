import { getFilteredAdvertisements } from '@/apis/ads';
import Resource from '@/helpers/Resource';
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

  getAdvertisementsWithFilter(filter: SearchFilter): Promise<void>;
}

const useAdvertisements = create<AdvertisementsState>((set, get) => ({
  advertisements: Resource.idle(),

  async getAdvertisementsWithFilter(filter = {}) {
    const advertisements = get().advertisements.abort().reload();
    set({ advertisements });
    set({
      advertisements: await Resource.wrapPromise(
        getFilteredAdvertisements(filter),
      ),
    });
  },
}));

export default useAdvertisements;
