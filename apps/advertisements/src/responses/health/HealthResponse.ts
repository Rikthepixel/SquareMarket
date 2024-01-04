import { z } from 'zod';

export const healthResponseSchema = z.object({
  online: z.boolean(),
  status: z.string(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;
