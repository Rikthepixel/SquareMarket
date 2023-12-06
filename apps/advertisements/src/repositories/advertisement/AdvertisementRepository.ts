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

export interface UserAdvertisement
  extends Pick<
    Advertisement,
    'uid' | 'id' | 'title' | 'description' | 'price' | 'currency'
  > {
  category: Category;
  published_at: NonNullable<Advertisement['published_at']>;
}

export interface UserDraftAdvertisement
  extends Omit<UserAdvertisement, 'published_at'> {}

export interface CreateAdvertisement extends Omit<Advertisement, 'id'> {}

export default interface AdvertisementRepository {
  getPublished: () => Promise<PublicAdvertisement[]>;
  getByUser: (userId: number) => Promise<UserAdvertisement[]>;
  getDraftsByUser: (userId: number) => Promise<UserDraftAdvertisement[]>;

  changeDraftStatus: (
    adUidOrId: UidOrId,
    newDraftStatus: boolean,
    publishedAt: Date | null,
  ) => Promise<void>;
  create: (ad: CreateAdvertisement) => Promise<void>;
}
