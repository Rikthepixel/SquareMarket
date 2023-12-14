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

interface Category {
  uid: string;
  name: string;
}

interface Property {
  uid: string;
  name: string;
  options: {
    uid: string;
    name: string;
  }[];
}

interface AdvertisementEditorState {
  created: Resource<{ uid: string }>;
  advertisement: Resource<Advertisement>;
  categories: Resource<Category[]>;
  properties: Resource<Property[]>;

  load(uid: string): Promise<void>;
  loadProperties(categoryUid: string): Promise<void>;
  create(): Promise<void>;
  setCategory(uid?: string): Promise<void>;
  save(): Promise<void>;
}

const useAdvertisementEditor = create<AdvertisementEditorState>((set, get) => ({
  created: Resource.idle(),
  advertisement: Resource.idle(),
  categories: Resource.idle(),
  properties: Resource.idle(),

  async load(uid) {
    if (get().advertisement.isLoading()) return;
    const loaded = Resource.loading();
    set({ advertisement: loaded });
    set({
      advertisement: await Resource.wrapPromise(
        getAdvertisement(uid, loaded.signal()).then((ad) => {
          if (ad.category?.uid) get().loadProperties(ad.category.uid);
          return ad;
        }),
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

  async loadProperties() {},

  async setCategory(uid) {
    // Load new properties
    // Reset values
    const state = get();

    set({ properties: state.properties.abort().loading() });
  },

  async reset() {
    set({
      created: Resource.idle(),
      advertisement: Resource.idle(),
      properties: Resource.idle(),
      categories: Resource.idle(),
    });
  },

  async save() {},
}));

export default useAdvertisementEditor;
