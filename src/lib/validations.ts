import { z } from "zod";

// Finding #5 fix: every write is validated before it touches the database.
export const createTaskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Title is required.")
    .max(200, "Title must be 200 characters or fewer."),
  priority: z.enum(["low", "medium", "high"], {
    errorMap: () => ({ message: "Pick a valid priority." }),
  }),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
