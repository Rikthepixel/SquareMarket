import { UidOrId } from '../../helpers/identifiers';
import { Advertisement } from '../../entities/Advertisement';
import { Category } from '../../entities/Category';
import { User } from '../../entities/User';

export interface PublicAdvertisement
  extends Pick<
    Advertisement,
    'uid' | 'id' | 'title' | 'description' | 'price' | 'currency'
  > {
  images: string[];
  seller: Pick<User, 'username' | 'provider_id' | 'id'>;
  category: Category;
  published_at: NonNullable<Advertisement['published_at']>;
}

export interface UserPublishedAdvertisement
  extends Required<
    Pick<
      Advertisement,
      'uid' | 'id' | 'title' | 'description' | 'price' | 'currency'
    >
  > {
  images: string[];
  category: Category;
  published_at: NonNullable<Advertisement['published_at']>;
}

export interface UserDraftAdvertisement
  extends Omit<UserPublishedAdvertisement, 'published_at' | 'category'> {
  images: string[];
  category: UserPublishedAdvertisement['category'] | null;
}

export interface InsertableAdvertisement {
  uid: string;
  user_id: number;
  draft: boolean;
  published_at: Date | null;
}

export interface UpdatableAdvertisement {
  title?: string | null;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  draft: boolean;
  published_at: Date | null;

  category_id?: number | null;
  propertyValues?: Record<string, string>;
}

export interface DetailedAdvertisement extends Advertisement {
  category?: Category;
  images: string[];
  propertyValues: {
    uid: string;
    category_property_uid: string;
    category_property_option_uid: string;
  }[];
}

export interface AdvertisementFilter {
  content?: string;
  category?: string;
  propertyOptions?: string[];
}

export interface FilteredAdvertisement {
  uid: string;
  title?: string;
  description?: string;
  images: string[];
  price?: number;
  currency?: string;
  published_at: Date;
}

export default interface AdvertisementRepository {
  get(uid: string): Promise<DetailedAdvertisement | null>;
  getId(uid: string): Promise<number | null>;
  getFiltered(filter: AdvertisementFilter): Promise<FilteredAdvertisement[]>;
  getPublished(): Promise<PublicAdvertisement[]>;
  getPublishedByUser(userId: number): Promise<UserPublishedAdvertisement[]>;
  getDraftsByUser(userId: number): Promise<UserDraftAdvertisement[]>;
  create(ad: InsertableAdvertisement): Promise<void>;
  put(uid: UidOrId, ad: UpdatableAdvertisement): Promise<void>;
}
