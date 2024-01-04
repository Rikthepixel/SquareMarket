import { z } from 'zod';
import sanitize from '../../helpers/sanitize';

export const finishProfileRequestSchema = z.object({
  username: z.string().min(1).max(255).transform(sanitize),
  default_currency: z.string().length(3),
});

export type FinishProfileRequest = z.infer<typeof finishProfileRequestSchema>;
