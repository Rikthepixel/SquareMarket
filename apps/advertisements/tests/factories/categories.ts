import { faker } from '@faker-js/faker';
import { Category } from '../../src/entities/Category';

export function createCategory(overrides: Partial<Category> = {}): Category {
  return {
    id: faker.number.int(),
    uid: faker.string.uuid(),
    name: faker.string.sample(),
    ...overrides,
  };
}
