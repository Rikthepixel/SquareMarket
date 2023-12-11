import { z } from 'zod';
import sanitize from '../../helpers/sanitize';

export const createAdvertisementRequestSchema = z.object({
  category_uid: z.string(),
  title: z.string().transform(sanitize),
  description: z.string().transform(sanitize),
  price: z.number(),
  currency: z.string().length(3),
  draft: z.boolean(),

  properties: z.array(
    z
      .object({
        property_uid: z.string(),
        option_uid: z.string(),
      })
      .or(
        z.object({
          property_uid: z.string(),
          value: z.string(),
        }),
      ),
  ),
});

export type CreateAdvertisementRequest = z.infer<
  typeof createAdvertisementRequestSchema
>;
