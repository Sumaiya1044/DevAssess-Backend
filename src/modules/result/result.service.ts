import { db } from "../../prisma/db.js";
import AppError from "../../utils/AppError.js";

const getMyResult = async (
  resultId: number,
  candidateId: number,
) => {
  const result = await db.orm.public.Result
    .where({ id: resultId })
    .first();

  if (!result) {
    throw new AppError(404, "Result not found");
  }

  const attempt = await db.orm.public.Attempt
    .where({ id: result.attemptId })
    .first();

  if (!attempt || attempt.candidateId !== candidateId) {
    throw new AppError(404, "Result not found");
  }

  return result;
};

const getMyResultByAttempt = async (
  attemptId: number,
  candidateId: number,
) => {
  const attempt = await db.orm.public.Attempt
    .where({ id: attemptId })
    .first();

  if (!attempt || attempt.candidateId !== candidateId) {
    throw new AppError(404, "Attempt not found");
  }

  const result = await db.orm.public.Result
    .where({ attemptId })
    .first();

  if (!result) {
    throw new AppError(404, "Result is not available yet");
  }

  return result;
};

export const ResultServices = {
  getMyResult,
  getMyResultByAttempt,
};
