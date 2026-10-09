import { z } from "zod";

export const initiatePaymentSchema = z.object({
  body: z.object({
    amount: z.number().positive("Amount must be greater than 0"),
    payerReference: z.string().min(1, "Payer reference is required"),
    invoiceNumber: z.string().min(1, "Invoice number is required"),
  }),
});

export const executePaymentSchema = z.object({
  body: z.object({
    paymentId: z.string().min(1, "Payment ID is required"),
  }),
});
