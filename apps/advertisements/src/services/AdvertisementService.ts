import AdvertisementRepository from '../repositories/advertisement/AdvertisementRepository';

export default class AdvertisementService {
  constructor(private adRepository: AdvertisementRepository) {}

  async getPublished() {
    return this.adRepository.getPublished();
  }

  async getByUser(userId: number) {
    return this.adRepository.getByUser(userId);
  }

  async getDraftsByUser(userId: number) {
    return this.adRepository.getDraftsByUser(userId);
  }
}
