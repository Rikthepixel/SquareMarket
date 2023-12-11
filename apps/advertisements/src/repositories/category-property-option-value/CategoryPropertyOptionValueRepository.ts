import CategoryPropertyOptionValue from '../../entities/CategoryPropertyOptionValue';

export interface InsertableOptionValue
  extends Pick<
    CategoryPropertyOptionValue,
    | 'uid'
    | 'advertisement_id'
    | 'category_property_option_id'
  > {
}

export default interface CategoryPropertyOptionValueRepository {
  createMultiple(values: InsertableOptionValue[]): Promise<void>;
}
