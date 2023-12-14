import { UidOrId } from '../../helpers/identifiers';
import { Advertisement } from '../../entities/Advertisement';
import { Category } from '../../entities/Category';
import { User } from '../../entities/User';

export interface PublicAdvertisement
  extends Pick<
    Advertisement,
    'uid' | 'id' | 'title' | 'description' | 'price' | 'currency'
  > {
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
  category: Category;
  published_at: NonNullable<Advertisement['published_at']>;
}

export interface UserDraftAdvertisement
  extends Omit<UserPublishedAdvertisement, 'published_at' | 'category'> {
  category: UserPublishedAdvertisement['category'] | null;
}

export interface InsertableAdvertisement
  extends Omit<
    Advertisement,
    'id' | 'category_id' | 'title' | 'description' | 'price' | 'currency'
  > {
  category_id?: number;

  title?: string;
  description?: string;
  price?: number;
  currency?: string;
}

export interface DetailedAdvertisement extends Advertisement {
  category?: Category;
  propertyValues: {
    uid: string;
    category_property_uid: string;
    category_property_option_uid: string;
  }[];
}

export default interface AdvertisementRepository {
  get(uid: string): Promise<DetailedAdvertisement | null>;
  getPublished: () => Promise<PublicAdvertisement[]>;
  getPublishedByUser: (userId: number) => Promise<UserPublishedAdvertisement[]>;
  getDraftsByUser: (userId: number) => Promise<UserDraftAdvertisement[]>;

  changeDraftStatus: (
    adUidOrId: UidOrId,
    newDraftStatus: boolean,
    publishedAt: Date | null,
  ) => Promise<void>;
  create: (ad: InsertableAdvertisement) => Promise<void>;
}
