import z from "zod";

export const createServiceRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  due_date: z.coerce.date(),
});
