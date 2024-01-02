import { randomUUID } from 'crypto';
import AdvertisementRepository, {
  AdvertisementFilter,
  InsertableAdvertisement,
} from '../repositories/advertisement/AdvertisementRepository';
import UserRepository from '../repositories/user/UserRepository';
import NotFoundException from '../exceptions/common/NotFound';
import { UidOrId, isUid } from '../helpers/identifiers';
import CategoryRepository from '../repositories/category/CategoryRepository';
import CategoryPropertyOptionValueRepository from '../repositories/category-property-option-value/CategoryPropertyOptionValueRepository';
import CategoryPropertyOptionRepository from '../repositories/category-property-option/CategoryPropertyOptionRepository';
import BadRequestException from '../exceptions/common/BadRequest';

interface UpdatableAdvertisement {
  title?: string;
  description?: string;
  price?: number;
  currency?: string;

  draft: boolean;

  category_uid?: string;
  propertyValues?: Record<string, string>;
}

export default class AdvertisementService {
  constructor(
    private adRepository: AdvertisementRepository,
    private userRepository: UserRepository,
    private categoryRepository: CategoryRepository,
    private propertyOptionsRepository: CategoryPropertyOptionRepository,
    private propertyOptionValueRepository: CategoryPropertyOptionValueRepository,
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

  async put(uid: string, changes: UpdatableAdvertisement) {
    const advertisement = await this.adRepository.get(uid).then((ad) => {
      if (ad) return ad;
      throw new NotFoundException('advertisement');
    });

    const category = changes.category_uid
      ? await this.categoryRepository.get(changes.category_uid).then((cat) => {
          if (cat) return cat;
          throw new NotFoundException('category');
        })
      : null;

   if (category) {
      const options = await this.propertyOptionsRepository
        .getValidForCategory(
          category.id,
          Object.entries(changes.propertyValues ?? {}).map(
            ([, optionUid]) => optionUid,
          ),
        )
        .then((opts) => {
          if (opts) return opts;
          throw new BadRequestException(
            'category property values',
            'The category property values were not valid for the given category',
          );
        });

      await this.propertyOptionValueRepository.syncByAdvertisement(
        advertisement.id,
        options.map((opt) => ({
          uid: randomUUID(),
          option_uid: opt.uid,
        })),
      );
    } else {
      await this.propertyOptionValueRepository.syncByAdvertisement(
        advertisement.id,
        [],
      );
    }

    await this.adRepository.put(advertisement.id, {
      category_id: category?.id ?? null,
      title: changes.title ?? null,
      description: changes.description ?? null,
      price: changes.price ?? null,
      currency: changes.currency ?? null,
      draft: changes.draft,
      published_at: changes.draft ? null : new Date(),
    });
  }
}
