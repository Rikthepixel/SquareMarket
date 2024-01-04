import Knex from 'knex';
import CategoryRepository, {
  CategoryWithProperties,
} from './CategoryRepository';
import { Category } from '../../entities/Category';
import {
  UidOrId,
  UidsToBuffers,
  getType,
  isUid,
} from '../../helpers/identifiers';
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
      .first<UidsToBuffers<Category> | null>()
      .then((cat) => {
        if (!cat) return null;
        return { ...cat, uid: this.db.fn.binToUuid(cat.uid) };
      });
  }

  async getWithProperties(
    uidOrId: UidOrId,
  ): Promise<CategoryWithProperties | null> {
    return this.db.transaction(async (trx) => {
      const category = await trx
        .table('categories as cat')
        .where(
          `cat.${getType(uidOrId)}`,
          isUid(uidOrId) ? trx.fn.uuidToBin(uidOrId) : uidOrId,
        )
        .select('*')
        .first<UidsToBuffers<Category> | null>()
        .then((c) => (c ? { ...c, uid: trx.fn.binToUuid(c.uid) } : c));

      if (!category) return null;

      const properties = await trx
        .table('category_properties as prop')
        .where('prop.category_id', category.id)
        .select<UidsToBuffers<CategoryProperty>[]>('*');

      const options = await trx
        .table('category_property_options as opt')
        .whereIn(
          'opt.category_property_id',
          properties.map((p) => p.id),
        )
        .select<UidsToBuffers<CategoryPropertyOption>[]>('*')
        .then((os) => os.map((o) => ({ ...o, uid: trx.fn.binToUuid(o.uid) })));

      return {
        ...category,
        properties: properties.map((prop) => {
          return {
            ...prop,
            uid: trx.fn.binToUuid(prop.uid),
            options: options.filter(
              (opt) => opt.category_property_id === prop.id,
            ),
          };
        }),
      };
    });
  }

  async getAll(): Promise<Category[]> {
    return await this.db
      .table('categories as cat')
      .select<UidsToBuffers<Category>[]>('cat.id', 'cat.uid', 'cat.name')
      .then((cats) =>
        cats.map<Category>((c) => ({ ...c, uid: this.db.fn.binToUuid(c.uid) })),
      );
  }
}
