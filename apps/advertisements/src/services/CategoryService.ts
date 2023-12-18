import CategoryRepository from '../repositories/category/CategoryRepository';

export default class CategoryService {
  constructor(private categoryRepository: CategoryRepository) {}

  async getAll() {
    return await this.categoryRepository.getAll()
  }

  async getWithProperties(uid: string) {
    return await this.categoryRepository.getWithProperties(uid)
  }
}
