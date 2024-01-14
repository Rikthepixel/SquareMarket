import { z } from 'zod';

export const chatResponseSchema = z.object({
  uid: z.string().uuid(),
  users: z
    .object({
      username: z.string(),
      provider_id: z.string(),
    })
    .array(),
  messages: z
    .object({
      uid: z.string().uuid(),
      user: z.object({
        username: z.string(),
        provider_id: z.string(),
      }),
      content: z.string(),
      seen_at: z.null().or(z.coerce.date()),
      sent_at: z.coerce.date(),
    })
    .array(),
});

export type ChatResponse = z.infer<typeof chatResponseSchema>;
