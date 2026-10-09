import { db } from "../../prisma/db.js";
import AppError from "../../utils/AppError.js";

type UserRole = "ADMIN" | "COMPANY";
type InvitationResponse = "ACCEPTED" | "DECLINED";

interface CreateInvitationPayload {
  assessmentId: number;
  candidateId: number;
  expiresAt?: string;
}

const createInvitation = async (
  payload: CreateInvitationPayload,
  invitedById: number,
  invitedByRole: UserRole,
) => {
  const assessment = await db.orm.public.Assessment
    .where({ id: payload.assessmentId })
    .first();

  if (!assessment || assessment.deletedAt) {
    throw new AppError(404, "Assessment not found");
  }

  if (assessment.status !== "PUBLISHED") {
    throw new AppError(
      400,
      "Invitations can only be sent for published assessments",
    );
  }

  if (invitedByRole === "COMPANY") {
    const company = await db.orm.public.Company
      .where({ id: assessment.companyId })
      .first();

    if (!company || company.deletedAt) {
      throw new AppError(404, "Company not found");
    }

    if (company.ownerId !== invitedById) {
      throw new AppError(
        403,
        "You can only invite candidates to your own company's assessments",
      );
    }
  }

  const candidate = await db.orm.public.User
    .where({ id: payload.candidateId })
    .first();

  if (!candidate || candidate.deletedAt) {
    throw new AppError(404, "Candidate not found");
  }

  if (candidate.role !== "CANDIDATE") {
    throw new AppError(400, "Selected user is not a candidate");
  }

  if (candidate.status !== "ACTIVE") {
    throw new AppError(400, "Candidate account is not active");
  }

  if (payload.expiresAt) {
    const expiryTime = new Date(payload.expiresAt).getTime();

    if (Number.isNaN(expiryTime) || expiryTime <= Date.now()) {
      throw new AppError(400, "Invitation expiry must be a future date");
    }
  }

  const existingInvitation = await db.orm.public.Invitation
    .where({
      assessmentId: payload.assessmentId,
      candidateId: payload.candidateId,
    })
    .first();

  if (existingInvitation) {
    if (existingInvitation.status === "EXPIRED") {
      const renewedInvitation = await db.orm.public.Invitation
        .where({ id: existingInvitation.id })
        .update({
          status: "PENDING",
          invitedById,
          expiresAt: payload.expiresAt ?? null,
          respondedAt: null,
        });

      if (!renewedInvitation) {
        throw new AppError(500, "Failed to renew invitation");
      }

      return renewedInvitation;
    }

    throw new AppError(400, "Candidate has already been invited to this assessment");
  }

  const invitation = await db.orm.public.Invitation.create({
    assessmentId: payload.assessmentId,
    candidateId: payload.candidateId,
    invitedById,
    status: "PENDING",
    expiresAt: payload.expiresAt ?? null,
  });

  return invitation;
};

const getMyInvitations = async (candidateId: number) => {
  const invitations = await db.orm.public.Invitation
    .where({ candidateId })
    .all();

  const now = Date.now();

  for (const invitation of invitations) {
    if (
      invitation.status === "PENDING" &&
      invitation.expiresAt &&
      new Date(invitation.expiresAt).getTime() <= now
    ) {
      await db.orm.public.Invitation
        .where({ id: invitation.id })
        .update({ status: "EXPIRED" });
    }
  }

  return db.orm.public.Invitation
    .where({ candidateId })
    .all();
};

const respondToInvitation = async (
  invitationId: number,
  candidateId: number,
  response: InvitationResponse,
) => {
  const invitation = await db.orm.public.Invitation
    .where({ id: invitationId })
    .first();

  if (!invitation || invitation.candidateId !== candidateId) {
    throw new AppError(404, "Invitation not found");
  }

  if (invitation.status !== "PENDING") {
    throw new AppError(
      400,
      `Invitation cannot be responded to because its status is ${invitation.status}`,
    );
  }

  if (
    invitation.expiresAt &&
    new Date(invitation.expiresAt).getTime() <= Date.now()
  ) {
    await db.orm.public.Invitation
      .where({ id: invitationId })
      .update({ status: "EXPIRED" });

    throw new AppError(400, "Invitation has expired");
  }

  const updatedInvitation = await db.orm.public.Invitation
    .where({ id: invitationId })
    .update({
      status: response,
      respondedAt: new Date().toISOString(),
    });

  if (!updatedInvitation) {
    throw new AppError(500, "Failed to update invitation");
  }

  return updatedInvitation;
};

export const InvitationServices = {
  createInvitation,
  getMyInvitations,
  respondToInvitation,
};
