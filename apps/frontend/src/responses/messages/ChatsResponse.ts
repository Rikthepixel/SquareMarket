import { z } from 'zod';

export const chatsResponseSchema = z
  .object({
    uid: z.string(),
    users: z
      .object({
        provider_id: z.string(),
        username: z.string(),
      })
      .array(),
  })
  .array();

export type ChatsResponse = z.infer<typeof chatsResponseSchema>;
