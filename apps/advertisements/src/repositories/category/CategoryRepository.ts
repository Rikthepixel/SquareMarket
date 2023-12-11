import { Category } from '../../entities/Category';
import CategoryProperty from '../../entities/CategoryProperty';
import CategoryPropertyOption from '../../entities/CategoryPropertyOption';
import { UidOrId } from '../../helpers/identifiers';

export interface CategoryWithProperties extends Category {
  properties: Array<
    CategoryProperty & {
      options: CategoryPropertyOption[];
    }
  >;
}

export default interface CategoryRepository {
  get(uidOrId: UidOrId): Promise<Category | null>;
  getWithProperties(uidOrId: UidOrId): Promise<CategoryWithProperties | null>;
}
