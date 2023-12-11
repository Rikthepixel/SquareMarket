import { randomUUID } from 'crypto';
import { Advertisement } from '../entities/Advertisement';
import AdvertisementRepository from '../repositories/advertisement/AdvertisementRepository';
import UserRepository from '../repositories/user/UserRepository';
import NotFoundException from '../exceptions/common/NotFound';
import CategoryRepository from '../repositories/category/CategoryRepository';
import CategoryPropertyRepository from '../repositories/category-property/CategoryPropertyRepository';
import CategoryPropertyOptionRepository from '../repositories/category-property-option/CategoryPropertyOptionRepository';
import CategoryPropertyOptionValueRepository, {
  InsertableOptionValue,
} from '../repositories/category-property-option-value/CategoryPropertyOptionValueRepository';
import BadRequestException from '../exceptions/common/BadRequest';

interface CreateAdvertisementProps
  extends Omit<
    Advertisement,
    'id' | 'uid' | 'user_id' | 'category_id' | 'published_at'
  > {
  user_uid: string;
  category_uid: string;

  property_option_uids: string[];
}

export default class AdvertisementService {
  constructor(
    private adRepository: AdvertisementRepository,
    private userRepository: UserRepository,
    private categoryRepository: CategoryRepository,
    private propRepository: CategoryPropertyRepository,
    private optRepository: CategoryPropertyOptionRepository,
    private optValueRepository: CategoryPropertyOptionValueRepository,
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

  async create(props: CreateAdvertisementProps) {
    const uid = randomUUID();

    const [user, category] = await Promise.all([
      this.userRepository.get(props.user_uid),
      this.categoryRepository.get(props.category_uid),
    ] as const);

    if (!user || !category) {
      throw new NotFoundException(!user ? 'User' : 'Category');
    }

    const validProps = await this.optRepository.isValidForCategory(
      category.id,
      props.property_option_uids,
    );

    if (!validProps) {
      throw new BadRequestException(
        'property_option_uids',
        'they are not valid for the given category',
      );
    }

    const adToInsert = {
      uid,
      user_id: user.id,
      category_id: category.id,
      title: props.title,
      description: props.description,
      price: props.price,
      currency: props.currency,
      draft: props.draft,
      published_at: props.draft ? null : new Date(),
    } as const;

    const insertedAd = await this.adRepository.create(adToInsert);
    const optionValuesToInsert = await this.optRepository
      .getIdsByUids(props.property_option_uids)
      .then((ids) =>
        ids.map<InsertableOptionValue>((option_id) => ({
          uid: randomUUID(),
          advertisement_id: insertedAd.id,
          category_property_option_id: option_id,
        })),
      );

    await this.optValueRepository.createMultiple(optionValuesToInsert);
  }
}
