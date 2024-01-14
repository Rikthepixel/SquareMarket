import { z } from "zod";

export const chatCreatedResponse = z.object({
  uid: z.string()
})
