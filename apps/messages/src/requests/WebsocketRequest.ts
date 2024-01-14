import { z } from 'zod';

export const websocketRequestSchema = z
  .object({ type: z.coerce.string() })
  .passthrough();
