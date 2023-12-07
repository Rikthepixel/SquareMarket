import { z } from 'zod';
import sanitize from '../../helpers/sanitize';

export const createAdvertisementRequestSchema = z.object({
  category_uid: z.string(),
  title: z.string().transform(sanitize),
  description: z.string().transform(sanitize),
  price: z.number(),
  currency: z.string().length(3),
  draft: z.boolean(),
});

export type CreateAdvertisementRequest = z.infer<
  typeof createAdvertisementRequestSchema
>;
