import { z } from "zod";

const addProblemToAssessmentSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    problemId: z.number().int().positive(),
    position: z.number().int().positive(),
    marksOverride: z.number().int().positive().optional(),
  }),
});

export const AssessmentProblemValidations = {
  addProblemToAssessmentSchema,
};
