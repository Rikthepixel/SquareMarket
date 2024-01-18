import Knex from 'knex';
import ConsoleLogger from '../loggers/ConsoleLogger';
import IoCContainer from 'tioc';
import { createBrokerAsPromised } from 'rascal';
import { BlobServiceClient } from '@azure/storage-blob';
import dbConfig from '../configs/db';
import authConfig from '../configs/auth';
import brokerConfig from '../configs/broker';
import KnexAdvertisementRepository from '../repositories/advertisement/KnexAdvertisementRepository';
import AdvertisementService from '../services/AdvertisementService';
import auth from '../middleware/auth';
import KnexUserRepository from '../repositories/user/KnexUserRepository';
import UserService from '../services/UserService';
import UsersSubscription from '../subscribers/UsersSubscription';
import KnexCategoryRepository from '../repositories/category/KnexCategoryRepository';
import KnexCategoryPropertyOptionRepository from '../repositories/category-property-option/KnexCategoryPropertyOptionRepository';
import KnexCategoryPropertyOptionValueRepository from '../repositories/category-property-option-value/KnexCategoryPropertyOptionValueRepository';
import CategoryService from '../services/CategoryService';
import FileImageRepository from '../repositories/images/FileImageRepository';
import { mkdirSync } from 'fs';
import path from 'path';
import ImageService from '../services/ImageService';
import AzureImageRepository from '../repositories/images/AzureImageRepository';

const depenencyProvider = (c: IoCContainer) =>
  c
    .addSingleton('db', () => Knex(dbConfig))
    .addScoped('blobStorage', () => {
      const connectionString = process.env.STORAGE_AZURE_CONNECTION_STRING;
      if (!connectionString) {
        throw Error(
          "STORAGE_DRIVER='azure' was selected, but no STORAGE_AZURE_CONNECTION_STRING was specified",
        );
      }
      return BlobServiceClient.fromConnectionString(connectionString);
    })
    .addSingleton(
      'broker',
      async () => await createBrokerAsPromised(brokerConfig),
    )
    .addSingleton('logger', () => new ConsoleLogger())
    .addScoped('authMiddleware', () => auth(authConfig))
    .addScoped(
      'UserRespository',
      (c) => new KnexUserRepository(c.resolve('db')),
    )
    .addScoped(
      'AdvertisementRepository',
      (c) => new KnexAdvertisementRepository(c.resolve('db')),
    )
    .addScoped(
      'CategoryRepository',
      (c) => new KnexCategoryRepository(c.resolve('db')),
    )
    .addScoped(
      'CategoryPropertyOptionRepository',
      (c) => new KnexCategoryPropertyOptionRepository(c.resolve('db')),
    )
    .addScoped(
      'CategoryPropertyOptionValueRepository',
      (c) => new KnexCategoryPropertyOptionValueRepository(c.resolve('db')),
    )
    .addScoped('ImageRepository', (c) => {
      if (process.env.STORAGE_DRIVER === 'azure') {
        return new AzureImageRepository(
          c.resolve('db'),
          c.resolve('blobStorage').getContainerClient('advertisement-images'),
        );
      } else if (process.env.STORAGE_DRIVER === 'file') {
        const basePath = path.join(process.cwd(), 'storage', 'images');
        mkdirSync(basePath, { recursive: true });
        return new FileImageRepository(c.resolve('db'), basePath);
      } else {
        throw new Error('Invalid STORAGE_DRIVER');
      }
    })
    .addScoped(
      'UserService',
      (c) => new UserService(c.resolve('UserRespository')),
    )
    .addScoped(
      'AdvertisementService',
      (c) =>
        new AdvertisementService(
          c.resolve('AdvertisementRepository'),
          c.resolve('UserRespository'),
          c.resolve('CategoryRepository'),
          c.resolve('CategoryPropertyOptionRepository'),
          c.resolve('CategoryPropertyOptionValueRepository'),
          c.resolve('ImageRepository'),
        ),
    )
    .addScoped(
      'CategoryService',
      (c) => new CategoryService(c.resolve('CategoryRepository')),
    )
    .addScoped(
      'ImageService',
      (c) => new ImageService(c.resolve('ImageRepository')),
    )
    .addSingleton(
      'UsersSubscription',
      async (c) =>
        new UsersSubscription(
          await c.resolve('broker'),
          c.resolve('logger'),
          c.resolve('UserService'),
        ),
    );

export default depenencyProvider;
