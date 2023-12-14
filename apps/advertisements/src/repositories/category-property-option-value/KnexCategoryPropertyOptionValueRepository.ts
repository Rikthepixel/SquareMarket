import { Knex } from 'knex';
import CategoryPropertyOptionValueRepository, {
  InsertableOptionValue,
} from './CategoryPropertyOptionValueRepository';
import CategoryPropertyOptionValue from '../../entities/CategoryPropertyOptionValue';
import { UidsToBuffers } from '../../helpers/identifiers';

export default class KnexCategoryPropertyOptionValueRepository
  implements CategoryPropertyOptionValueRepository
{
  constructor(private db: Knex) {}

  private table = 'category_property_option_values';

  getByAdvertisement(id: number): Promise<CategoryPropertyOptionValue[]> {
    return this.db
      .table(this.table + ' as vals')
      .where('vals.advertisement_id', id)
      .select<UidsToBuffers<CategoryPropertyOptionValue>[]>('*')
      .then((vals) =>
        vals.map((v) => ({ ...v, uid: this.db.fn.binToUuid(v.uid) })),
      );
  }

  createMultiple(values: InsertableOptionValue[]): Promise<void> {
    return this.db.table(this.table).insert(values);
  }
}
