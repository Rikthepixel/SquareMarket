import { Knex } from 'knex';
import CategoryPropertyOptionValueRepository, {
  SyncableOptionValue,
} from './CategoryPropertyOptionValueRepository';
import CategoryPropertyOptionValue from '../../entities/CategoryPropertyOptionValue';
import { UidsToBuffers } from '../../helpers/identifiers';

export default class KnexCategoryPropertyOptionValueRepository
  implements CategoryPropertyOptionValueRepository
{
  constructor(private db: Knex) {}

  private table = 'category_property_option_values';

  async getByAdvertisement(id: number): Promise<CategoryPropertyOptionValue[]> {
    return await this.db
      .table(this.table + ' as vals')
      .where('vals.advertisement_id', id)
      .select<UidsToBuffers<CategoryPropertyOptionValue>[]>('*')
      .then((vals) =>
        vals.map((v) => ({ ...v, uid: this.db.fn.binToUuid(v.uid) })),
      );
  }

  async syncByAdvertisement(
    advertisementId: number,
    values: SyncableOptionValue[],
  ): Promise<void> {
    return await this.db.transaction(async (trx) => {
      const options =
        values.length === 0
          ? null
          : await trx
              .table('category_property_options')
              .whereIn(
                'uid',
                values.map((val) => trx.fn.uuidToBin(val.option_uid)),
              )
              .select<{ id: number; uid: Buffer }[]>('id', 'uid')
              .then((opts) =>
                opts.map((opt) => ({
                  id: opt.id,
                  uid: trx.fn.binToUuid(opt.uid),
                })),
              );

      await trx
        .table(this.table)
        .where('advertisement_id', advertisementId)
        .delete();

      if (!options) return;

      await trx.table(this.table).insert(
        values.map((value) => {
          const option = options.find((opt) => opt.uid === value.option_uid);
          if (!option) return undefined;
          return {
            uid: trx.fn.uuidToBin(value.uid),
            advertisement_id: advertisementId,
            category_property_option_id: option.id,
          };
        }),
      );
    });
  }
}
