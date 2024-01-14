import { z } from "zod";

export const startChatRequestSchema = z.object({
  user: z.string()
})
