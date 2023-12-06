import { z } from "zod";


export const profileStatusResponseSchema = z.object({
  status: z.literal("complete").or(z.literal("setup-required"))
})

export type ProfileStatusResponse = z.infer<typeof profileStatusResponseSchema>
