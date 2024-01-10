import { UidOrId } from '../../helpers/identifiers';
import { Readable } from 'stream';

export interface UploadableImage {
  uid: string;
  content: Buffer;
  mime: string;
}

export default interface ImageRepository {
  upload(advertisementId: number, images: UploadableImage[]): Promise<void>;

  getByAdvertisement(advertisementId: number): Promise<string[]>;
  deleteByAdvertisement(advertisementId: number): Promise<void>;
  deleteMultiple(imagesToDelete: UidOrId[]): Promise<void>;

  getContent(
    uidOrId: UidOrId,
  ): Promise<{ content: Readable; mime: string } | null>;
}
