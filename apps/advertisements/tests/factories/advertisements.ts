import { faker } from '@faker-js/faker';
import {
  PublicAdvertisement,
  UserAdvertisement,
} from '../../src/repositories/advertisement/AdvertisementRepository';
import { createCategory } from './categories';
import { createUser } from './users';

export function createPublicAdvertisement(
  overrides: Partial<PublicAdvertisement> = {},
): PublicAdvertisement {
  return {
    id: faker.number.int(),
    uid: faker.string.uuid(),
    price: faker.number.float(),
    title: faker.string.sample(),
    category: createCategory(),
    seller: createUser(),
    currency: faker.finance.currency().code,
    description: faker.word.words({ count: { min: 10, max: 50 } }),
    published_at: faker.date.past(),
    ...overrides,
  };
}

export function createUserAdvertisement(
  overrides: Partial<UserAdvertisement> = {},
): UserAdvertisement {
  return {
    id: faker.number.int(),
    uid: faker.string.uuid(),
    price: faker.number.float(),
    title: faker.string.sample(),
    category: createCategory(),
    currency: faker.finance.currency().code,
    description: faker.word.words({ count: { min: 10, max: 50 } }),
    published_at: faker.date.past(),
    ...overrides,
  };
}
