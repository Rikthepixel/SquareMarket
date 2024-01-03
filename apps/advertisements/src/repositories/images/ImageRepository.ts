import { ReadStream } from 'fs';
import { UidOrId } from '../../helpers/identifiers';

export interface UploadableImage {
  uid: string;
  content: Buffer;
  mime: string;
}

export default interface ImageRepository {
  upload(advertisementId: number, images: UploadableImage[]): Promise<void>;

  getByAdvertisement(advertisementId: number): Promise<string[]>;
  deleteMultiple(imagesToDelete: UidOrId[]): Promise<void>;

  getContent(
    uidOrId: UidOrId,
  ): Promise<{ content: ReadStream; mime: string } | null>;
}
