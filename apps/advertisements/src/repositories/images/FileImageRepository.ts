import { Knex } from 'knex';
import fs from 'fs/promises';
import { ReadStream, createReadStream, existsSync } from 'fs';
import { UidOrId, castUidOrId, getType, isId } from '../../helpers/identifiers';
import ImageRepository, { UploadableImage } from './ImageRepository';
import path from 'path';

export default class FileImageRepository implements ImageRepository {
  constructor(
    private db: Knex,
    private basePath: string,
  ) {}

  async upload(
    advertisementId: number,
    images: UploadableImage[],
  ): Promise<void> {
    this.db.transaction(async (trx) => {
      await Promise.all([
        trx.table('images').insert(
          images.map((img) => ({
            uid: trx.fn.uuidToBin(img.uid),
            advertisement_id: advertisementId,
            mime: img.mime,
          })),
        ),
        ...images.map(async (img) =>
          fs.writeFile(path.join(this.basePath, img.uid), img.content),
        ),
      ]);
    });
  }

  async getByAdvertisement(advertisementId: number): Promise<string[]> {
    return await this.db
      .table('images')
      .where('advertisement_id', advertisementId)
      .select<{ uid: Buffer }[]>('images.uid')
      .then((imgs) => imgs.map((img) => this.db.fn.binToUuid(img.uid)));
  }

  async deleteMultiple(imagesToDelete: UidOrId[]): Promise<void> {
    await this.db.transaction(async (trx) => {
      const imageUidsToDelete: Buffer[] = [];
      const imageIdsToDelete: number[] = [];

      for (const image of imagesToDelete) {
        if (isId(image)) {
          imageIdsToDelete.push(image);
          continue;
        }
        imageUidsToDelete.push(trx.fn.uuidToBin(image));
      }

      const images = await trx
        .table('images')
        .whereIn('images.uid', imageUidsToDelete)
        .orWhereIn('images.id', imageUidsToDelete)
        .select<{ id: number; uid: Buffer }[]>('uid', 'id');

      if (!images || images.length === 0) return;

      await trx
        .table('images')
        .whereIn(
          'id',
          images.map((img) => img.id),
        )
        .del();

      await Promise.all([
        ...images.map(async (img) => {
          const imagePath = path.join(this.basePath, trx.fn.binToUuid(img.uid));
          if (!existsSync(imagePath)) return null;
          await fs.unlink(path.join(this.basePath, trx.fn.binToUuid(img.uid)));
        }),
      ]);
    });
  }

  async getContent(
    uidOrId: UidOrId,
  ): Promise<{ content: ReadStream; mime: string } | null> {
    const image = await this.db
      .table('images')
      .where(
        `images.${getType(uidOrId)}`,
        castUidOrId(uidOrId, this.db.fn.uuidToBin),
      )
      .select('images.mime', 'images.uid')
      .first<{ mime: string; uid: Buffer } | null>();

    if (!image) return null;

    const imagePath = path.join(this.basePath, this.db.fn.binToUuid(image.uid));
    if (!existsSync(imagePath)) return null;

    const fileStream = createReadStream(imagePath).on('error', (error) => {
      throw error;
    });

    return {
      content: fileStream,
      mime: image.mime,
    };
  }
}
