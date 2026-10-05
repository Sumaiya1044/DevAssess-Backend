import { z } from "zod";

const JsonValue = z.union([
  z.string(),
  z.number(),
  z.boolean(),
  z.null(),
  z.array(z.any()),
  z.record(z.string(), z.any()),
]);

const createSubmissionSchema = z.object({
  body: z.object({
    attemptId: z.number().int().positive(),
    assessmentQuestionId: z.number().int().positive(),
    answer: JsonValue.optional(),
    code: z.string().optional(),
    language: z.string().max(50).optional(),
  }),
});

const submissionIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const SubmissionValidations = {
  createSubmissionSchema,
  submissionIdSchema,
};
