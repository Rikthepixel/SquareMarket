import { z } from 'zod';

export const getPublishedAdvertisementsResponseSchema = z
  .object({
    uid: z.string(),
    title: z.string(),
    description: z.string(),
    price: z.number(),
    currency: z.string(),
    category: z.object({
      uid: z.string(),
      name: z.string(),
    }),
    images: z.string().array(),
    published_at: z.date(),
  })
  .array();

export type GetPublishedAdvertisementsResponse = z.infer<
  typeof getPublishedAdvertisementsResponseSchema
>;
