import { z } from 'zod';

export const advertisementCreatedResponse = z.object({
  uid: z.string(),
});

export type AdvertisementCreatedResponse = z.infer<
  typeof advertisementCreatedResponse
>;
