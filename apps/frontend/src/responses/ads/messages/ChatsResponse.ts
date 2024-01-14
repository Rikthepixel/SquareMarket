import { z } from 'zod';

export const chatsResponseSchema = z
  .object({
    uid: z.string(),
    user: z.object({
      uid: z.string(),
      username: z.string(),
    }),
  })
  .array();

export type ChatsResponse = z.infer<typeof chatsResponseSchema>;
