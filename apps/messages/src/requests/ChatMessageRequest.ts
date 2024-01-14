import { z } from 'zod';

export const chatMessageRequestSchema = z.object({
  content: z.string().min(1),
});
