import CategoryPropertyOptionValue from '../../entities/CategoryPropertyOptionValue';
import { UidOrId } from '../../helpers/identifiers';

export interface InsertableOptionValue
  extends Pick<
    CategoryPropertyOptionValue,
    'uid' | 'advertisement_id' | 'category_property_option_id'
  > {}

export interface SyncableOptionValue {
  uid: string;
  option_uid: string;
}

export default interface CategoryPropertyOptionValueRepository {
  getByAdvertisement(uidOrId: UidOrId): Promise<CategoryPropertyOptionValue[]>;
  syncByAdvertisement(
    advertisementId: number,
    values: SyncableOptionValue[],
  ): Promise<void>;
}
