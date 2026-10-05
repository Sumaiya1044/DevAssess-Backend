type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };
import { db } from "../../prisma/db.js";
import AppError from "../../utils/AppError.js";

type ProblemType = "MCQ" | "WRITTEN" | "CODING";
type UserRole = "ADMIN" | "COMPANY";

interface CreateProblemPayload {
  companyId: number;
  type: ProblemType;
  title: string;
  description: string;
  marks?: number;
  options?: JsonValue;
  expectedAnswer?: JsonValue;
  solution?: string;
  testCases?: JsonValue;
}

interface UpdateProblemPayload {
  type?: ProblemType;
  title?: string;
  description?: string;
  marks?: number;
  options?: JsonValue;
  expectedAnswer?: JsonValue;
  solution?: string;
  testCases?: JsonValue;
}

const createProblem = async (
  payload: CreateProblemPayload,
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
      "You can only create problems for your own company",
    );
  }

  const problem = await db.orm.public.Question.create({
    companyId: payload.companyId,
    createdById,
    type: payload.type,
    title: payload.title,
    description: payload.description,
    marks: payload.marks ?? 1,
    options: payload.options !== undefined ? JSON.stringify(payload.options) : undefined,
    expectedAnswer: payload.expectedAnswer !== undefined ? JSON.stringify(payload.expectedAnswer) : undefined,
    solution: payload.solution ?? null,
    testCases: payload.testCases !== undefined ? JSON.stringify(payload.testCases) : undefined,
  });

  return problem;
};

const getSingleProblem = async (problemId: number) => {
  const problem = await db.orm.public.Question
    .where({ id: problemId })
    .first();

  if (!problem || problem.deletedAt) {
    throw new AppError(404, "Problem not found");
  }

  return problem;
};

const updateProblem = async (
  problemId: number,
  payload: UpdateProblemPayload,
  userId: number,
  userRole: UserRole,
) => {
  const problem = await getSingleProblem(problemId);

  if (userRole === "COMPANY") {
    const company = await db.orm.public.Company
      .where({ id: problem.companyId })
      .first();

    if (!company || company.deletedAt) {
      throw new AppError(404, "Company not found");
    }

    if (company.ownerId !== userId) {
      throw new AppError(
        403,
        "You can only update problems for your own company",
      );
    }
  }

  const updatedProblem = await db.orm.public.Question
    .where({ id: problemId })
    .update({
      ...(payload.type !== undefined && { type: payload.type }),
      ...(payload.title !== undefined && { title: payload.title }),
      ...(payload.description !== undefined && {
        description: payload.description,
      }),
      ...(payload.marks !== undefined && { marks: payload.marks }),
      ...(payload.options !== undefined && { options: payload.options }),
      ...(payload.expectedAnswer !== undefined && {
        expectedAnswer: payload.expectedAnswer,
      }),
      ...(payload.solution !== undefined && { solution: payload.solution }),
      ...(payload.testCases !== undefined && { testCases: payload.testCases }),
    });

  if (!updatedProblem) {
    throw new AppError(500, "Failed to update problem");
  }

  return updatedProblem;
};

const deleteProblem = async (
  problemId: number,
  userId: number,
  userRole: UserRole,
) => {
  const problem = await getSingleProblem(problemId);

  if (userRole === "COMPANY") {
    const company = await db.orm.public.Company
      .where({ id: problem.companyId })
      .first();

    if (!company || company.deletedAt) {
      throw new AppError(404, "Company not found");
    }

    if (company.ownerId !== userId) {
      throw new AppError(
        403,
        "You can only delete problems for your own company",
      );
    }
  }

  const deletedProblem = await db.orm.public.Question
    .where({ id: problemId })
    .update({
      deletedAt: new Date().toISOString(),
    });

  if (!deletedProblem) {
    throw new AppError(500, "Failed to delete problem");
  }

  return null;
};

export const ProblemServices = {
  createProblem,
  getSingleProblem,
  updateProblem,
  deleteProblem,
};
