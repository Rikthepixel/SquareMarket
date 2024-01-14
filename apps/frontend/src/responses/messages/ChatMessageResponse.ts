import { z } from 'zod';

export const chatMessageResponseSchema = z.object({
  uid: z.string().uuid(),
  user: z.object({
    username: z.string(),
    provider_id: z.string(),
  }),
  content: z.string(),
  seen_at: z.coerce.date().nullable(),
  sent_at: z.coerce.date(),
});

export type ChatMessageResponse = z.infer<typeof chatMessageResponseSchema>;
