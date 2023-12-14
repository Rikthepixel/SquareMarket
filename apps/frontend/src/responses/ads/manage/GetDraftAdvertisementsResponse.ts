import { z } from 'zod';

export const getDraftAdvertisementsResponseSchema = z
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
  })
  .array();

export type GetDraftAdvertisementsResponse = z.infer<
  typeof getDraftAdvertisementsResponseSchema
>;
