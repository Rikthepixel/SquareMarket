import { VALID_CURRENCIES } from '@/configs/advertisements';
import { z } from 'zod';

const editPublishedAdvertisementFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  price: z.coerce.number(),
  currency: z.enum(VALID_CURRENCIES),
  category: z.string().min(1).uuid("Category can't be none"),
  options: z.record(z.object({
    value: z.string().uuid().or(z.literal('none')).optional(),
  })),
  published: z.literal(true),
});

export type EditPublishedAdvertisementSchema = z.infer<
  typeof editPublishedAdvertisementFormSchema
>;

export default editPublishedAdvertisementFormSchema;
