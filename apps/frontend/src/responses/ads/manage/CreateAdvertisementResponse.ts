import { z } from 'zod';

export const createAdvertisementResponseSchema = z.object({
  uid: z.string(),
});

export type CreateAdvertisementResponse = z.infer<
  typeof createAdvertisementResponseSchema
>;
