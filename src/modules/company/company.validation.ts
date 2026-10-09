import { z } from "zod";

const companyIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("Company ID must be a positive number"),
  }),
});

const createCompanySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(200),
    description: z.string().max(5000).optional(),
    industry: z.string().max(200).optional(),
    logo: z.string().url().optional(),
    website: z.string().url().optional(),
  }),
});

const updateCompanySchema = z.object({
  body: z
    .object({
      name: z.string().min(2).max(200).optional(),
      description: z.string().max(5000).optional(),
      industry: z.string().max(200).optional(),
      logo: z.string().url().optional(),
      website: z.string().url().optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required",
    }),
});

export const CompanyValidations = {
  companyIdSchema,
  createCompanySchema,
  updateCompanySchema,
};
