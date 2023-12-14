import { Knex } from 'knex';
import CategoryPropertyOptionRepository from './CategoryPropertyOptionRepository';
import CategoryPropertyOption from '../../entities/CategoryPropertyOption';
import {
  UidOrId,
  UidsToBuffers,
  castUidOrId,
  getType,
  isId,
} from '../../helpers/identifiers';

export default class KnexCategoryPropertyOptionRepository
  implements CategoryPropertyOptionRepository
{
  constructor(private db: Knex) {}

  getMultipleByUid(uids: string[]) {
    return this.db
      .table('category_property_options as opts')
      .whereIn(
        'opts.uid',
        uids.map((u) => this.db.fn.uuidToBin(u)),
      )
      .select();
  }

  async getValidForCategory(categoryUidOrId: UidOrId, options: UidOrId[]) {
    const optionIds: number[] = [];
    const optionUids: string[] = [];

    for (const opt of options) {
      if (isId(opt)) {
        optionIds.push(opt);
        continue;
      }
      optionUids.push(opt);
    }

    const result = await this.db
      .table('category_property_options as opts')
      .distinct('opts.id')
      .whereIn('opts.id', optionIds)
      .orWhereIn('opts.uid', optionUids)
      .innerJoin(
        'category_properties as props',
        'props.id',
        '=',
        'opts.category_property_id',
      )
      .innerJoin(
        'categories as cats',
        'cats.id',
        '=',
        'category_properties.category_id',
      )
      .where(
        `cats.${getType(categoryUidOrId)}`,
        castUidOrId(categoryUidOrId, this.db.fn.uuidToBin),
      )
      .select<
        UidsToBuffers<
          Pick<CategoryPropertyOption, 'id' | 'uid' | 'category_property_id'>
        >[]
      >('opts.id', 'opts.uid', 'opts.category_property_option_id');

    if (result.length !== options.length) return null;

    const occurredPropertyIds: number[] = [];
    for (const resultOption of result) {
      if (occurredPropertyIds.includes(resultOption.category_property_id)) {
        return null;
      }
      occurredPropertyIds.push(resultOption.category_property_id);
    }

    return result.map((o) => ({ ...o, uid: this.db.fn.binToUuid(o.uid) }));
  }
}
