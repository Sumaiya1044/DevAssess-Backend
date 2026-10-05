import { z } from "zod";

const createAssessmentSchema = z.object({
  body: z.object({
    companyId: z.number().int().positive(),
    title: z.string().min(3).max(200),
    description: z.string().max(5000).optional(),
    durationMinutes: z.number().int().positive(),
    passingScore: z.number().min(0).optional(),
    maxAttempts: z.number().int().positive().default(1),
    price: z.number().min(0).default(0),
  }),
});

const updateAssessmentSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z
    .object({
      title: z.string().min(3).max(200).optional(),
      description: z.string().max(5000).optional(),
      durationMinutes: z.number().int().positive().optional(),
      passingScore: z.number().min(0).optional(),
      maxAttempts: z.number().int().positive().optional(),
      price: z.number().min(0).optional(),
      startsAt: z.string().datetime().optional(),
      endsAt: z.string().datetime().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),
});

const assessmentIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const AssessmentValidations = {
  createAssessmentSchema,
  updateAssessmentSchema,
  assessmentIdSchema,
};
