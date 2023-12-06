import { z } from 'zod';

export const finishProfileRequestSchema = z.object({
  username: z.string().min(1).max(255),
  default_currency: z.string().length(3),
});

export type FinishProfileRequest = z.infer<typeof finishProfileRequestSchema>;
