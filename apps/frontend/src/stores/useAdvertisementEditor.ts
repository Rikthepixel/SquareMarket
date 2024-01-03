import {
  createAdvertisement,
  getAdvertisement,
  putAdvertisement,
  uploadAdvertisementImage,
} from '@/apis/ads/manage';
import Resource from '@/helpers/Resource';
import { FileWithPath } from '@mantine/dropzone';
import { create } from 'zustand';

interface Advertisement {
  uid: string;
  title?: string;
  description?: string;
  price?: number;
  currency?: string;
  draft: boolean;
  published_at: Date | null;
  images: string[];

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

export interface EditedAdvertisement {
  title?: string | null;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  category?: string | null;
  published?: boolean;
  propertyValues?: Record<string, string>;

  images: string[];
  imagesToUpload: FileWithPath[];
}

interface AdvertisementEditorState {
  created: Resource<{ uid: string }>;
  advertisement: Resource<Advertisement>;
  edited: EditedAdvertisement;
  isSaving: boolean;

  load(uid: string): Promise<void>;
  create(): Promise<void>;
  setEdited(edited: Partial<EditedAdvertisement>): void;
  save(): Promise<void>;
  resetEdited(): void;
  reset(): void;
}

const useAdvertisementEditor = create<AdvertisementEditorState>((set, get) => ({
  created: Resource.idle(),
  advertisement: Resource.idle(),
  isSaving: false,
  edited: {
    images: [],
    imagesToUpload: [],
  },

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

  setEdited(edited) {
    set((current) => ({
      edited: { ...current.edited, ...edited },
    }));
  },

  resetEdited() {
    set({
      edited: {
        images: [],
        imagesToUpload: [],
      },
    });
  },

  reset() {
    set({
      created: Resource.idle(),
      advertisement: Resource.idle(),
      isSaving: false,
      edited: {
        images: [],
        imagesToUpload: [],
      },
    });
  },

  async save() {
    const state = get();
    const ad = state.advertisement.unwrapValue();
    if (!ad || state.isSaving) return;

    set({ isSaving: true });
    const { imagesToUpload, images, ...edited } = state.edited;
    const uploadedImages =
      imagesToUpload.length > 0
        ? await uploadAdvertisementImage(ad.uid, imagesToUpload).catch((e) => {
            set({ isSaving: false });
            throw e;
          })
        : [];

    await putAdvertisement(ad.uid, {
      ...edited,
      images: [...uploadedImages, ...images],
    }).catch((e) => {
      set({ isSaving: false });
      throw e;
    });

    set({
      isSaving: false,
      advertisement: await Resource.wrapPromise(
        getAdvertisement(ad.uid, state.advertisement.abort().reload().signal()),
      ),
    });
  },
}));

export default useAdvertisementEditor;
