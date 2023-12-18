import { createAdvertisement, getAdvertisement } from '@/apis/ads/manage';
import Resource from '@/helpers/Resource';
import { create } from 'zustand';

interface Advertisement {
  uid: string;
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  draft: boolean;
  published_at: Date | null;

  category?: {
    uid: string;
    name: string;
  };

  propertyValues: {
    uid: string;
    category_property_uid: string;
    category_property_option_uid: string;
  }[];
}

interface AdvertisementEditorState {
  created: Resource<{ uid: string }>;
  advertisement: Resource<Advertisement>;

  load(uid: string): Promise<void>;
  create(): Promise<void>;
  setCategory(uid?: string): Promise<void>;
  save(): Promise<void>;
}

const useAdvertisementEditor = create<AdvertisementEditorState>((set, get) => ({
  created: Resource.idle(),
  advertisement: Resource.idle(),

  async load(uid) {
    if (get().advertisement.isLoading()) return;
    const advertisement = Resource.loading();
    set({ advertisement });
    set({
      advertisement: await Resource.wrapPromise(
        getAdvertisement(uid, advertisement.signal()),
      ),
    });
  },

  async create() {
    if (get().created.isLoading()) return;
    set({ created: Resource.loading() });
    set({
      created: await Resource.wrapPromise(createAdvertisement()),
    });
  },

  async setCategory(uid) {
    // Load new properties
    // Reset values
  },

  async reset() {
    set({
      created: Resource.idle(),
      advertisement: Resource.idle(),
    });
  },

  async save() {},
}));

export default useAdvertisementEditor;
