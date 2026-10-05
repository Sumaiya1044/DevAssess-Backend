import { db } from "../../prisma/db.js";
import AppError from "../../utils/AppError.js";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

interface CreateSubmissionPayload {
  attemptId: number;
  assessmentQuestionId: number;
  answer?: JsonValue;
  code?: string;
  language?: string;
}

const createSubmission = async (
  payload: CreateSubmissionPayload,
  candidateId: number,
) => {
  const attempt = await db.orm.public.Attempt
    .where({ id: payload.attemptId })
    .first();

  if (!attempt || attempt.candidateId !== candidateId) {
    throw new AppError(404, "Attempt not found");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new AppError(
      400,
      `Cannot submit an answer when attempt status is ${attempt.status}`,
    );
  }

  if (
    attempt.expiresAt &&
    new Date(attempt.expiresAt).getTime() <= Date.now()
  ) {
    await db.orm.public.Attempt
      .where({ id: attempt.id })
      .update({
        status: "EXPIRED",
      });

    throw new AppError(400, "Attempt time has expired");
  }

  const assessmentQuestion = await db.orm.public.AssessmentQuestion
    .where({
      id: payload.assessmentQuestionId,
      assessmentId: attempt.assessmentId,
    })
    .first();

  if (!assessmentQuestion) {
    throw new AppError(
      404,
      "Question is not part of this assessment",
    );
  }

  if (
    payload.answer === undefined &&
    payload.code === undefined
  ) {
    throw new AppError(
      400,
      "Either answer or code is required",
    );
  }

  const existingSubmission = await db.orm.public.Submission
    .where({
      attemptId: attempt.id,
      assessmentQuestionId: assessmentQuestion.id,
    })
    .first();

  if (existingSubmission) {
    throw new AppError(
      400,
      "This question has already been submitted for this attempt",
    );
  }

  const submission = await db.orm.public.Submission.create({
    attemptId: attempt.id,
    assessmentQuestionId: assessmentQuestion.id,
    questionId: assessmentQuestion.questionId,
    candidateId,
    ...(payload.answer !== undefined && {
      answer: JSON.stringify(payload.answer),
    }),
    ...(payload.code !== undefined && {
      code: payload.code,
    }),
    ...(payload.language !== undefined && {
      language: payload.language,
    }),
    status: "PENDING",
    updatedAt: new Date().toISOString(),
  });

  return submission;
};

const getMySubmission = async (
  submissionId: number,
  candidateId: number,
) => {
  const submission = await db.orm.public.Submission
    .where({ id: submissionId })
    .first();

  if (!submission || submission.candidateId !== candidateId) {
    throw new AppError(404, "Submission not found");
  }

  return submission;
};

export const SubmissionServices = {
  createSubmission,
  getMySubmission,
};
