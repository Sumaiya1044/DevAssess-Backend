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

export const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("User ID must be a positive number"),
  }),
  body: z.object({
    role: z.enum(["ADMIN", "COMPANY", "CANDIDATE"]),
  }),
});
