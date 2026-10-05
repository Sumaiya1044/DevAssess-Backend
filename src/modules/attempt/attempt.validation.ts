import { z } from "zod";

const startAttemptSchema = z.object({
  body: z.object({
    assessmentId: z.number().int().positive(),
  }),
});

const attemptIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const AttemptValidations = {
  startAttemptSchema,
  attemptIdSchema,
};
