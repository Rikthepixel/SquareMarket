import { VALID_CURRENCIES } from '@/configs/advertisements';
import { z } from 'zod';

const editPublishedAdvertisementFormSchema = z.object({
  title: z.string().min(1, 'The title must at least contain 1 character'),
  description: z
    .string()
    .min(10, 'The description must at least have 10 characters'),
  price: z.coerce.number(),
  currency: z.enum(VALID_CURRENCIES),
  category: z
    .string()
    .min(1)
    .uuid('Published advertisements must have a category'),
  options: z.record(
    z.object({
      value: z.string().uuid().or(z.literal('none')).optional(),
    }),
  ),
  images: z
    .string()
    .array()
    .min(1, 'Published advertisements must have at least one image'),
  published: z.literal(true),
});

export type EditPublishedAdvertisementSchema = z.infer<
  typeof editPublishedAdvertisementFormSchema
>;

export default editPublishedAdvertisementFormSchema;
