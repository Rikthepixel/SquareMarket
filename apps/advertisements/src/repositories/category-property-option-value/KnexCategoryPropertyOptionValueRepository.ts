import { Knex } from 'knex';
import CategoryPropertyOptionValueRepository, {
  InsertableOptionValue,
} from './CategoryPropertyOptionValueRepository';

export default class KnexCategoryPropertyOptionValueRepository
  implements CategoryPropertyOptionValueRepository
{
  constructor(private db: Knex) {}

  createMultiple(values: InsertableOptionValue[]): Promise<void> {
    return this.db.table('category_property_option_values').insert(values);
  }
}
