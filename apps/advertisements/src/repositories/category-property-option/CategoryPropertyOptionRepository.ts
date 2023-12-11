import CategoryPropertyOption from '../../entities/CategoryPropertyOption';
import { UidOrId } from '../../helpers/identifiers';

export default interface CategoryPropertyOptionRepository {
  getMultipleByUid(uids: string[]): Promise<CategoryPropertyOption[]>;
  getIdsByUids(uids: string[]): Promise<number[]>
  isValidForCategory(
    categoryUidOrId: UidOrId,
    options: UidOrId[],
  ): Promise<boolean>;
}
