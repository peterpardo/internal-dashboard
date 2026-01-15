import z from "zod";

export const signInSchema = z.object({
  tenantId: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
});
