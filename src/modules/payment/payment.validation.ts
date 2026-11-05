import { z } from "zod";

export const initiatePaymentSchema = z.object({
  body: z.object({
    assessmentId: z.number().int().positive("Valid assessment ID is required"),
    payerReference: z
      .string()
      .trim()
      .min(1, "Payer reference is required")
      .max(255, "Payer reference is too long"),
  }),
});

export const executePaymentSchema = z.object({
  body: z.object({
    paymentId: z
      .string()
      .trim()
      .min(1, "Payment ID is required"),
  }),
});
