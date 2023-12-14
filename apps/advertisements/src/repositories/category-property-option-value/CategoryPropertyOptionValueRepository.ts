import CategoryPropertyOptionValue from '../../entities/CategoryPropertyOptionValue';
import { UidOrId } from '../../helpers/identifiers';

export interface InsertableOptionValue
  extends Pick<
    CategoryPropertyOptionValue,
    'uid' | 'advertisement_id' | 'category_property_option_id'
  > {}

export default interface CategoryPropertyOptionValueRepository {
  getByAdvertisement(uidOrId: UidOrId): Promise<CategoryPropertyOptionValue[]>;
  createMultiple(values: InsertableOptionValue[]): Promise<void>;
}
