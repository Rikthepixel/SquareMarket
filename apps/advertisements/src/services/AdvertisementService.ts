import { randomUUID } from 'crypto';
import { Advertisement } from '../entities/Advertisement';
import AdvertisementRepository from '../repositories/advertisement/AdvertisementRepository';
import UserRepository from '../repositories/user/UserRepository';

interface CreateAdvertisementProps
  extends Omit<Advertisement, 'id' | 'uid' | 'user_id' | 'category_id'> {
  user_uid: string;
  category_uid: string;
}

export default class AdvertisementService {
  constructor(
    private adRepository: AdvertisementRepository,
    private userRepository: UserRepository,
  ) {}

  async getPublished() {
    return this.adRepository.getPublished();
  }

  async getByUser(userId: number) {
    return this.adRepository.getByUser(userId);
  }

  async getDraftsByUser(userId: number) {
    return this.adRepository.getDraftsByUser(userId);
  }

  /
  async create(ad: CreateAdvertisementProps) {
    const uid = randomUUID();
    const [user, category] = await Promise.all([
      this.userRepository.get(ad.user_uid),
      this.userRepository.get(ad.category_uid)
    ] as const)

    if (!user || !category){
      throw
    }

    const adToInsert = {
      uid,
      user_id: user.id,
      category_id: category.id,
      title: ad.title,
      description: ad.description,
      price: ad.price,
      currency: ad.currency,
      draft: ad.draft,
      published_at: ad.published_at,
    } as const;

    return await this.adRepository.create(adToInsert);
  }
}
