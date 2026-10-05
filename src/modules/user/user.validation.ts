import { z } from "zod";

export const updateMyProfileSchema = z.object({
  body: z
    .object({
      name: z.string().min(1, "Name is required").optional(),
      phone: z.string().min(7, "Phone number is invalid").optional(),
    })
    .refine(
      (data) => data.name !== undefined || data.phone !== undefined,
      {
        message: "At least one field is required",
      },
    ),
});
