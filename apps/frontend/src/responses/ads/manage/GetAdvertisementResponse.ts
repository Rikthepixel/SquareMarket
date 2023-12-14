import { z } from 'zod';

export const getAdvertisementResponseSchema = z.object({
  uid: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.number().optional(),
  currency: z.string().optional(),
  draft: z.boolean(),
  published_at: z.coerce.date().nullable(),

  category: z
    .object({
      uid: z.string(),
      name: z.string(),
    })
    .optional(),

  propertyValues: z.array(
    z.object({
      uid: z.string(),
      category_property_uid: z.string(),
      category_property_option_uid: z.string(),
    }),
  ),
});

export type GetAdvertisementResponse = z.infer<
  typeof getAdvertisementResponseSchema
>;
