import AdvertisementRepository from '../../src/repositories/advertisement/AdvertisementRepository';
import CategoryRepository from '../../src/repositories/category/CategoryRepository';
import UserRepository from '../../src/repositories/user/UserRepository';
import AdvertisementService from '../../src/services/AdvertisementService';
import { createCategory } from '../factories/categories';
import { createUser } from '../factories/users';

describe('AdvertisementService.create', function () {
  it.each([])('It should create the a new advertisemet', function () {
    const sut = new AdvertisementService(
      {
        create(ad) {
          return Promise.resolve();
        },
      } as unknown as AdvertisementRepository,
      {
        get(providerIdOrId) {
          return createUser({ provider_id: providerIdOrId as string });
        },
      } as unknown as UserRepository,
      {
        get(uidOrId) {
          return createCategory({ uid: uidOrId as string });
        },
      } as unknown as CategoryRepository,
      {
        getMultipleByUid(uids) {
            return
        },
      }
    );
  });
});
