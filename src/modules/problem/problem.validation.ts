import { z } from "zod";

const createProblemSchema = z.object({
  body: z.object({
    companyId: z.number().int().positive(),
    type: z.enum(["MCQ", "WRITTEN", "CODING"]),
    title: z.string().min(3).max(300),
    description: z.string().min(1).max(10000),
    marks: z.number().int().positive().default(1),
    options: z.any().optional(),
    expectedAnswer: z.any().optional(),
    solution: z.string().max(10000).optional(),
    testCases: z.any().optional(),
  }),
});

const updateProblemSchema = z.object({
  params: z.object({
    problemId: z.coerce.number().int().positive(),
  }),
  body: z
    .object({
      type: z.enum(["MCQ", "WRITTEN", "CODING"]).optional(),
      title: z.string().min(3).max(300).optional(),
      description: z.string().min(1).max(10000).optional(),
      marks: z.number().int().positive().optional(),
      options: z.any().optional(),
      expectedAnswer: z.any().optional(),
      solution: z.string().max(10000).optional(),
      testCases: z.any().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required for update",
    }),
});

const problemIdSchema = z.object({
  params: z.object({
    problemId: z.coerce.number().int().positive(),
  }),
});

export const ProblemValidations = {
  createProblemSchema,
  updateProblemSchema,
  problemIdSchema,
};
