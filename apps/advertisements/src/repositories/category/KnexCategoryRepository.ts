import Knex from 'knex';
import CategoryRepository, {
  CategoryWithProperties,
} from './CategoryRepository';
import { Category } from '../../entities/Category';
import { UidOrId, getType, isUid } from '../../helpers/identifiers';
import CategoryProperty from '../../entities/CategoryProperty';
import CategoryPropertyOption from '../../entities/CategoryPropertyOption';

export default class KnexCategoryRepository implements CategoryRepository {
  constructor(private db: Knex.Knex) {}

  async get(uidOrId: UidOrId): Promise<Category | null> {
    return this.db
      .table('categories as cat')
      .where(
        `cat.${getType(uidOrId)}`,
        isUid(uidOrId) ? this.db.fn.uuidToBin(uidOrId) : uidOrId,
      )
      .select('cat.id', 'cat.uid', 'cat.name')
      .first<Category | null>();
  }

  async getWithProperties(
    uidOrId: UidOrId,
  ): Promise<CategoryWithProperties | null> {
    const category = await this.db
      .table('categories as cat')
      .where(
        `cat.${getType(uidOrId)}`,
        isUid(uidOrId) ? this.db.fn.uuidToBin(uidOrId) : uidOrId,
      )
      .select('*')
      .first<Category | null>();

    if (!category) return null;

    const properties = await this.db
      .table('category_properties as prop')
      .where('prop.id', category.id)
      .select<CategoryProperty[]>('*');

    const options = await this.db
      .table('category_property_options as opt')
      .whereIn(
        'opt.id',
        properties.map((p) => p.id),
      )
      .select<CategoryPropertyOption[]>('*');

    return {
      ...category,
      properties: properties.map((prop) => {
        return {
          ...prop,
          options: options.filter(
            (opt) => opt.category_property_id === prop.id,
          ),
        };
      }),
    };
  }
}
