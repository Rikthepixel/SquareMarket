import NotFoundException from '../exceptions/common/NotFound';
import ImageRepository from '../repositories/images/ImageRepository';

export default class ImageService {
  constructor(private imageRepository: ImageRepository) {}
  async getContent(uid: string) {
    return await this.imageRepository.getContent(uid).then((content) => {
      if (content) return content;
      throw new NotFoundException('image');
    });
  }
}
