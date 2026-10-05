import { z } from "zod";

const createInvitationSchema = z.object({
  body: z.object({
    assessmentId: z.number().int().positive(),
    candidateId: z.number().int().positive(),
    expiresAt: z.string().datetime().optional(),
  }),
});

const invitationIdSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
});

const respondInvitationSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive(),
  }),
  body: z.object({
    status: z.enum(["ACCEPTED", "DECLINED"]),
  }),
});

export const InvitationValidations = {
  createInvitationSchema,
  invitationIdSchema,
  respondInvitationSchema,
};
