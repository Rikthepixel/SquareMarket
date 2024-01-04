import { z } from 'zod';

export const getCategoriesResponseSchema = z.array(
  z.object({
    uid: z.string(),
    name: z.string(),
  }),
);

export type GetCategoriesResponse = z.infer<typeof getCategoriesResponseSchema>;
