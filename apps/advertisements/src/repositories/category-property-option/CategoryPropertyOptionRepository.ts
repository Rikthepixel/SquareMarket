import CategoryPropertyOption from '../../entities/CategoryPropertyOption';
import { UidOrId } from '../../helpers/identifiers';

export default interface CategoryPropertyOptionRepository {
  getMultipleByUid(uids: string[]): Promise<CategoryPropertyOption[]>;
  /**
   * Returns the options if it is valid, if it isn't it returns null
   */
  getValidForCategory(
    categoryUidOrId: UidOrId,
    options: UidOrId[],
  ): Promise<
    Pick<CategoryPropertyOption, 'id' | 'uid' | 'category_property_id'>[] | null
  >;
}
