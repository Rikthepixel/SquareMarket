import { faker } from '@faker-js/faker';
import { User } from '../../src/entities/User';

export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: faker.number.int(),
    provider_id: faker.string.uuid(),
    username: faker.person.fullName(),
    default_currency: faker.finance.currency().code,
    ...overrides,
  };
}
