import z from "zod";

export const createServiceRequestSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  assigned_to: z.string().optional(),
  due_date: z.coerce.date(),
});

export const updateServiceRequestSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  clear_description: z.boolean().optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  clear_priority: z.boolean().optional(),
  assigned_to: z.string().optional(),
  clear_assigned_to: z.boolean().optional(),
  due_date: z.coerce.date().optional(),
  clear_due_date: z.boolean().optional(),
});
