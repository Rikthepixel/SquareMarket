import { z } from 'zod';

const published = z.object({
  title: z.string().min(1),
  description: z.string().min(10),
  price: z.coerce.number(),
  currency: z.enum(['EUR', 'USD']),
  category: z.string().uuid(),
  published: z.literal(true),
  propertyValues: z.record(z.string().uuid(), z.string().uuid()).optional(),
  images: z.string().array().min(1),
});

const draft = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  price: z.coerce.number().optional(),
  currency: z.enum(['EUR', 'USD']).optional(),
  category: z.string().uuid().optional(),
  published: z.literal(false),
  propertyValues: z.record(z.string().uuid(), z.string().uuid()).optional(),
  images: z.string().array().optional(),
});

export type PutAdvertisementRequest = z.infer<typeof published | typeof draft>;

export const putAdvertisementRequest = z
  .object({ published: z.boolean() })
  .passthrough()
  .superRefine((data, ctx): data is PutAdvertisementRequest => {
    const result = data.published
      ? published.safeParse(data)
      : draft.safeParse(data);

    if (result.success) return true;
    result.error.issues.forEach((iss) => ctx.addIssue(iss));
    return false;
  });
