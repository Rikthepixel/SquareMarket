import { Knex } from 'knex';
import CategoryPropertyRepository, {
  CategoryPropertyWithOptions,
} from './CategoryPropertyRepository';
import CategoryProperty from '../../entities/CategoryProperty';
import CategoryPropertyOption from '../../entities/CategoryPropertyOption';
import {
  UidOrId,
  castUidOrId,
  getType,
  isUid,
} from '../../helpers/identifiers';
import NotFoundException from '../../exceptions/common/NotFound';

export default class KnexCategoryPropertyRepository
  implements CategoryPropertyRepository
{
  constructor(private db: Knex) {}
  async getMultipleByUid(
    uids: string[],
  ): Promise<CategoryPropertyWithOptions[]> {
    return this.db.transaction(async (trx) => {
      const properties = await trx
        .table('category_properties as props')
        .whereIn(
          'props.uid',
          uids.map((id) => this.db.fn.uuidToBin(id)),
        )
        .select('props.id', 'props.uid', 'props.category_id', 'props.name')
        .then((props) =>
          props.map<CategoryProperty>((p) => ({
            ...p,
            uid: this.db.fn.binToUuid(p.uid),
          })),
        );

      const options = await trx
        .table('category_property_options as opts')
        .whereIn(
          'opts.category_property_id',
          properties.map((p) => p.id),
        )
        .select('opts.id', 'opts.uid', 'opts.category_property_id', 'opts.name')
        .then((opts) =>
          opts.map<CategoryPropertyOption>((opt) => ({
            ...opt,
            uid: this.db.fn.binToUuid(opt.uid),
          })),
        );

      return properties.map<CategoryPropertyWithOptions>((prop) => ({
        ...prop,
        options: options.filter((opt) => opt.category_property_id === prop.id),
      }));
    });
  }

  /**
   * @throws {NotFoundException} When Option cannot be found
   */
  async setOption(adId: number, optUidOrId: UidOrId) {
    return await this.db.transaction(async (trx) => {
      const option = await trx
        .table('category_property_options as opts')
        .select('id', 'category_property_id')
        .where(
          `opts.${getType(optUidOrId)}`,
          castUidOrId(optUidOrId, this.db.fn.uuidToBin),
        )
        .first<Pick<
          CategoryPropertyOption,
          'id' | 'category_property_id'
        > | null>();

      if (!option) {
        throw new NotFoundException('Property option');
      }

      trx.table("category_property_option_values").insert({

        'category_property_id',
        'advertisement_id',
        'category_property_option_id'
      })
    });
  }
}
