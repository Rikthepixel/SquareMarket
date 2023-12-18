import { randomUUID } from 'crypto';
import AdvertisementRepository, {
  AdvertisementFilter,
  InsertableAdvertisement,
} from '../repositories/advertisement/AdvertisementRepository';
import UserRepository from '../repositories/user/UserRepository';
import NotFoundException from '../exceptions/common/NotFound';
import { UidOrId, isUid } from '../helpers/identifiers';

export default class AdvertisementService {
  constructor(
    private adRepository: AdvertisementRepository,
    private userRepository: UserRepository,
  ) {}

  async getFiltered(filter: AdvertisementFilter) {
    return await this.adRepository.getFiltered(filter);
  }

  async getPublished() {
    return await this.adRepository.getPublished();
  }

  async getPublishedByUser(userUidOrId: UidOrId) {
    const userId = isUid(userUidOrId)
      ? await this.userRepository.get(userUidOrId).then((u) => u?.id)
      : userUidOrId;

    if (!userId) throw new NotFoundException('User');

    return this.adRepository.getPublishedByUser(userId);
  }

  async getDraftsByUser(userUidOrId: UidOrId) {
    const userId = isUid(userUidOrId)
      ? await this.userRepository.get(userUidOrId).then((u) => u?.id)
      : userUidOrId;

    if (!userId) throw new NotFoundException('User');

    return this.adRepository.getDraftsByUser(userId);
  }

  async get(uid: string) {
    return await this.adRepository.get(uid).then((ad) => {
      if (ad) return ad;
      throw new NotFoundException('Advertisement');
    });
  }

  async setCategory() {}

  async create(userUid: string) {
    const uid = randomUUID();

    const user = await this.userRepository.get(userUid);
    if (!user) throw new NotFoundException('User');

    const adToInsert: InsertableAdvertisement = {
      uid,
      user_id: user.id,
      draft: true,
      published_at: null,
    };

    await this.adRepository.create(adToInsert);
    return uid;
  }
}
