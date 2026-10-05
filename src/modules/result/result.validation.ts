import { z } from "zod";

const resultIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

export const ResultValidations = {
  resultIdSchema,
};
