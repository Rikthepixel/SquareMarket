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
import ImageRepository from '../repositories/images/ImageRepository';

interface UpdatableAdvertisement {
  title?: string | null;
  description?: string | null;
  price?: number | null;
  currency?: string | null;

  draft: boolean;

  category_uid?: string | null;
  images: string[];
  propertyValues?: Record<string, string> | null;
}

export default class AdvertisementService {
  constructor(
    private adRepository: AdvertisementRepository,
    private userRepository: UserRepository,
    private categoryRepository: CategoryRepository,
    private propertyOptionsRepository: CategoryPropertyOptionRepository,
    private propertyOptionValueRepository: CategoryPropertyOptionValueRepository,
    private imageRepository: ImageRepository,
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

  async addImages(uid: string, files: { content: Buffer; mime: string }[]) {
    const advertisementId = await this.adRepository.getId(uid).then((id) => {
      if (id) return id;
      throw new NotFoundException('advertisement');
    });

    const images = files.map((img) => ({ ...img, uid: randomUUID() }));
    await this.imageRepository.upload(advertisementId, images);
    console.log(await this.imageRepository.getByAdvertisement(advertisementId));
    return images.map((img) => img.uid);
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

  async unpublish(uid: string) {
    await this.adRepository.update(uid, {
      draft: true,
      published_at: null,
    });
  }

  async delete(uid: string) {
    const advertisementId = await this.adRepository.getId(uid).then((id) => {
      if (id) return id;
      throw new NotFoundException('advertisement');
    });

    await this.imageRepository.deleteByAdvertisement(advertisementId);
    await this.adRepository.delete(advertisementId);
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

    console.log({
      adImages: advertisement.images,
      changedImages: changes.images,
    });

    const allRemainingImagesValid = changes.images.every((img) =>
      advertisement.images.includes(img),
    );
    if (allRemainingImagesValid) {
      await this.imageRepository.deleteMultiple(
        advertisement.images.filter(
          (imgUid) => !changes.images.includes(imgUid),
        ),
      );
    } else {
      throw new BadRequestException(
        'images',
        "some images don't belong to the given advertisement",
      );
    }

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

    await this.adRepository.update(advertisement.id, {
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
