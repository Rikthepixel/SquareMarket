import { Knex } from 'knex';
import { ContainerClient } from '@azure/storage-blob';

import { UidOrId, castUidOrId, getType, isId } from '../../helpers/identifiers';
import ImageRepository, { UploadableImage } from './ImageRepository';
import { Readable } from 'stream';

export default class AzureImageRepository implements ImageRepository {
  constructor(
    private db: Knex,
    private blobStorage: ContainerClient,
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
        ...images.map(async (img) => {
          return this.blobStorage
            .getBlockBlobClient(img.uid)
            .uploadData(img.content);
        }),
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

  async deleteByAdvertisement(advertisementId: number): Promise<void> {
    await this.db.transaction(async (trx) => {
      const images = await trx
        .table('images')
        .where('advertisement_id', advertisementId)
        .select<{ uid: Buffer; id: number }[]>('uid', 'id');

      if (!images || images.length === 0) return;

      await trx
        .table('images')
        .whereIn(
          'id',
          images.map((img) => img.id),
        )
        .del();

      await Promise.all(
        images.map(async (img) => {
          return this.blobStorage
            .getBlockBlobClient(trx.fn.binToUuid(img.uid))
            .deleteIfExists();
        }),
      );
    });
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

      await Promise.all(
        images.map(async (img) => {
          return this.blobStorage
            .getBlockBlobClient(trx.fn.binToUuid(img.uid))
            .deleteIfExists();
        }),
      );
    });
  }

  async getContent(uidOrId: UidOrId) {
    const image = await this.db
      .table('images')
      .where(
        `images.${getType(uidOrId)}`,
        castUidOrId(uidOrId, this.db.fn.uuidToBin),
      )
      .select('images.mime', 'images.uid')
      .first<{ mime: string; uid: Buffer } | null>();

    if (!image) return null;

    const blobClient = this.blobStorage.getBlockBlobClient(
      this.db.fn.binToUuid(image.uid),
    );

    if (!(await blobClient.exists())) return null;

    return {
      content: await blobClient
        .download()
        .then((res) => new Readable().wrap(res.readableStreamBody!)),
      mime: image.mime,
    };
  }
}
