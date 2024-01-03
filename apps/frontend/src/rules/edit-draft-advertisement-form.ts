import { VALID_CURRENCIES } from '@/configs/advertisements';
import { z } from 'zod';

const editDraftAdvertisementSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().optional(),
  currency: z.enum(VALID_CURRENCIES).or(z.literal('none')).optional(),
  category: z.string().uuid().or(z.literal('none')).optional(),
  options: z.record(
    z.object({
      value: z.string().uuid().or(z.literal('none')).optional(),
    }),
  ),
  images: z.string().array(),
  published: z.literal(false),
});

export type EditDraftAdvertisementSchema = z.infer<
  typeof editDraftAdvertisementSchema
>;

export default editDraftAdvertisementSchema;
