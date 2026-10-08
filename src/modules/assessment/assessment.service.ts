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

const getAllAssessments = async (query: { page?: number; limit?: number; search?: string; status?: string; sort?: "asc" | "desc" }) => {
  const page = Math.max(1, query.page ?? 1);
  const limit = Math.min(50, Math.max(1, query.limit ?? 10));
  const offset = (page - 1) * limit;

  let assessments = await db.orm.public.Assessment
    .where({ deletedAt: null })
    .orderBy((assessment) => query.sort === "asc" ? assessment.createdAt.asc() : assessment.createdAt.desc())
    .all();

  if (query.status) {
    assessments = assessments.filter((assessment) => assessment.status === query.status);
  }

  if (query.search) {
    const search = query.search.toLowerCase();
    assessments = assessments.filter((assessment) => assessment.title.toLowerCase().includes(search) || assessment.description?.toLowerCase().includes(search));
  }

  const total = assessments.length;
  const data = assessments.slice(offset, offset + limit);

  return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
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

const publishAssessment = async (
  assessmentId: number,
  userId: number,
  userRole: UserRole,
) => {
  const assessment = await getSingleAssessment(assessmentId);

  if (assessment.status !== "DRAFT") {
    throw new AppError(400, "Only draft assessments can be published");
  }

  if (userRole === "COMPANY") {
    const company = await db.orm.public.Company
      .where({ id: assessment.companyId })
      .first();

    if (!company || company.deletedAt) {
      throw new AppError(404, "Company not found");
    }

    if (company.ownerId !== userId) {
      throw new AppError(403, "You can only publish assessments for your own company");
    }
  }

  const questions = await db.orm.public.AssessmentQuestion
    .where({ assessmentId })
    .all();

  if (questions.length === 0) {
    throw new AppError(400, "Add at least one problem before publishing the assessment");
  }

  const publishedAssessment = await db.orm.public.Assessment
    .where({ id: assessmentId })
    .update({
      status: "PUBLISHED",
      publishedAt: new Date().toISOString(),
    });

  if (!publishedAssessment) {
    throw new AppError(500, "Failed to publish assessment");
  }

  return publishedAssessment;
};

export const AssessmentServices = {
  createAssessment,
  getAllAssessments,
  getSingleAssessment,
  updateAssessment,
  deleteAssessment, publishAssessment,
};
