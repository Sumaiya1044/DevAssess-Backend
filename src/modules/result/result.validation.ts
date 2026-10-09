import { z } from "zod";

const resultIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Result ID must be a positive number"),
  }),
});

const attemptIdSchema = z.object({
  params: z.object({
    attemptId: z.coerce.number().int().positive("Attempt ID must be a positive number"),
  }),
});

export const ResultValidations = {
  resultIdSchema,
  attemptIdSchema,
};
