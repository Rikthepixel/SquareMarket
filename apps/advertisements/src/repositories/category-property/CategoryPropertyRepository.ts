import CategoryProperty from '../../entities/CategoryProperty';
import CategoryPropertyOption from '../../entities/CategoryPropertyOption';

export interface CategoryPropertyWithOptions extends CategoryProperty {
  options: CategoryPropertyOption[];
}

export default interface CategoryPropertyRepository {
  getMultipleByUid(uids: string[]): Promise<CategoryPropertyWithOptions[]>;
}
