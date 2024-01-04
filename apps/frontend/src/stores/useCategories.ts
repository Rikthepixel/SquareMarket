import { getCategories, getCategory } from '@/apis/ads/categories';
import Resource from '@/helpers/Resource';
import { create } from 'zustand';

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

interface CategoriesState {
  categories: Resource<Category[]>;
  category: Resource<Category & { properties: Property[] }>;

  loadCategories(): Promise<void>;
  loadCategory(uid: string): Promise<void>;
  resetCategory(): void;
}

const useCategories = create<CategoriesState>((set, get) => ({
  categories: Resource.idle(),
  category: Resource.idle(),

  async loadCategories() {
    if (get().categories.isLoading()) return;
    const categories = Resource.loading();
    set({ categories });
    set({
      categories: await Resource.wrapPromise(
        getCategories(categories.signal()),
      ),
    });
  },

  async loadCategory(uid: string) {
    const category = get().category.abort().reload();
    set({ category });
    set({
      category: await Resource.wrapPromise(getCategory(uid)),
    });
  },

  resetCategory() {
    set({ category: Resource.idle() });
  },
}));

export default useCategories;
