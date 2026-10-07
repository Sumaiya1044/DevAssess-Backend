import { db } from "../../prisma/db.js";
import AppError from "../../utils/AppError.js";

type UserRole = "ADMIN" | "COMPANY";

interface CreateAssessmentPayload {
  companyId: number;
  title: string;
  description?: string;
  durationMinutes: number;
  passingScore?: number;
  maxAttempts?: number;
  price?: number;
}

interface UpdateAssessmentPayload {
  title?: string;
  description?: string;
  durationMinutes?: number;
  passingScore?: number;
  maxAttempts?: number;
  price?: number;
  startsAt?: string;
  endsAt?: string;
}

const createAssessment = async (
  payload: CreateAssessmentPayload,
  createdById: number,
  creatorRole: UserRole,
) => {
  const company = await db.orm.public.Company
    .where({ id: payload.companyId })
    .first();

  if (!company || company.deletedAt) {
    throw new AppError(404, "Company not found");
  }

  if (creatorRole === "COMPANY" && company.ownerId !== createdById) {
    throw new AppError(
      403,
      "You can only create assessments for your own company",
    );
  }

  const assessment = await db.orm.public.Assessment.create({
    companyId: payload.companyId,
    createdById,
    title: payload.title,
    description: payload.description ?? null,
    durationMinutes: payload.durationMinutes,
    passingScore: payload.passingScore ?? null,
    maxAttempts: payload.maxAttempts ?? 1,
    price: payload.price ?? 0,
  });

  return assessment;
};

const getAllAssessments = async () => {
  const assessments = await db.orm.public.Assessment
    .where({ deletedAt: null })
    .orderBy((assessment) => assessment.createdAt.desc())
    .all();

  return assessments;
};

const getSingleAssessment = async (assessmentId: number) => {
  const assessment = await db.orm.public.Assessment
    .where({ id: assessmentId })
    .first();

  if (!assessment || assessment.deletedAt) {
    throw new AppError(404, "Assessment not found");
  }

  return assessment;
};

const updateAssessment = async (
  assessmentId: number,
  payload: UpdateAssessmentPayload,
  userId: number,
  userRole: UserRole,
) => {
  const assessment = await getSingleAssessment(assessmentId);

  if (userRole === "COMPANY") {
    const company = await db.orm.public.Company
      .where({ id: assessment.companyId })
      .first();

    if (!company || company.deletedAt) {
      throw new AppError(404, "Company not found");
    }

    if (company.ownerId !== userId) {
      throw new AppError(
        403,
        "You can only update assessments for your own company",
      );
    }
  }

  const updatedAssessment = await db.orm.public.Assessment
    .where({ id: assessmentId })
    .update({
      ...(payload.title !== undefined && { title: payload.title }),
      ...(payload.description !== undefined && {
        description: payload.description,
      }),
      ...(payload.durationMinutes !== undefined && {
        durationMinutes: payload.durationMinutes,
      }),
      ...(payload.passingScore !== undefined && {
        passingScore: payload.passingScore,
      }),
      ...(payload.maxAttempts !== undefined && {
        maxAttempts: payload.maxAttempts,
      }),
      ...(payload.price !== undefined && {
        price: payload.price,
      }),
      ...(payload.startsAt !== undefined && {
        startsAt: payload.startsAt,
      }),
      ...(payload.endsAt !== undefined && {
        endsAt: payload.endsAt,
      }),
    });

  if (!updatedAssessment) {
    throw new AppError(500, "Failed to update assessment");
  }

  return updatedAssessment;
};

const deleteAssessment = async (
  assessmentId: number,
  userId: number,
  userRole: UserRole,
) => {
  const assessment = await getSingleAssessment(assessmentId);

  if (userRole === "COMPANY") {
    const company = await db.orm.public.Company
      .where({ id: assessment.companyId })
      .first();

    if (!company || company.deletedAt) {
      throw new AppError(404, "Company not found");
    }

    if (company.ownerId !== userId) {
      throw new AppError(
        403,
        "You can only delete assessments for your own company",
      );
    }
  }

  const deletedAssessment = await db.orm.public.Assessment
    .where({ id: assessmentId })
    .update({
      deletedAt: new Date().toISOString(),
    });

  if (!deletedAssessment) {
    throw new AppError(500, "Failed to delete assessment");
  }

  return null;
};

export const AssessmentServices = {
  createAssessment,
  getAllAssessments,
  getSingleAssessment,
  updateAssessment,
  deleteAssessment,
};
