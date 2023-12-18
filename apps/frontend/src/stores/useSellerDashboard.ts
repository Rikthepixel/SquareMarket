import {
  getDraftAdvertisements,
  getPublishedAdvertisements,
} from '@/apis/ads/manage';
import useAuth from '@/lib/auth/stores/useAuth';
import Resource from '@/helpers/Resource';
import { create } from 'zustand';

interface Advertisement {
  uid: string;
  title?: string;
  description?: string;
  price?: number;
  currency?: string;

  category?: {
    uid: string;
    name: string;
  };
}

interface PublishedAdvertisement extends Required<Advertisement> {
  published_at: Date;
}

interface DraftAdvertisement extends Advertisement {}

interface SellerDashboardState {
  publishedAds: Resource<PublishedAdvertisement[]>;
  draftAds: Resource<DraftAdvertisement[]>;

  loadDrafts(): Promise<void>;
  loadPublished(): Promise<void>;
  reset(): void;
}

const useSellerDashboard = create<SellerDashboardState>((set, get) => ({
  publishedAds: Resource.idle(),
  draftAds: Resource.idle(),

  async loadDrafts() {
    if (get().draftAds.isLoading()) return;
    const drafts = Resource.loading();
    set({ draftAds: drafts });

    set({
      draftAds: await Resource.wrapPromise(
        getDraftAdvertisements(drafts.signal()),
      ),
    });
  },

  async loadPublished() {
    if (get().publishedAds.isLoading()) return;
    const published = Resource.loading();
    set(() => ({ publishedAds: published }));
    set({
      publishedAds: await Resource.wrapPromise(
        getPublishedAdvertisements(published.signal()),
      ),
    });
  },

  reset() {
    set({
      publishedAds: Resource.idle(),
      draftAds: Resource.idle(),
    });
  },
}));

useAuth.subscribe((auth, prevAuth) => {
  if (auth.user && auth.user == prevAuth.user) return;
  useSellerDashboard.getState().reset();
});

export default useSellerDashboard;
