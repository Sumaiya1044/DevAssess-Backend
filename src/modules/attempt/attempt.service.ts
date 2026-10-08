import { db } from "../../prisma/db.js";
import AppError from "../../utils/AppError.js";

interface StartAttemptPayload {
  assessmentId: number;
}

const normalizeAnswer = (value: unknown) => {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }

  return JSON.stringify(value).trim().toLowerCase();
};

const startAttempt = async (
  payload: StartAttemptPayload,
  candidateId: number,
) => {
  const assessment = await db.orm.public.Assessment
    .where({ id: payload.assessmentId })
    .first();

  if (!assessment || assessment.deletedAt) {
    throw new AppError(404, "Assessment not found");
  }

  if (assessment.status !== "PUBLISHED") {
    throw new AppError(400, "Only published assessments can be attempted");
  }

  const now = Date.now();

  if (
    assessment.startsAt &&
    new Date(assessment.startsAt).getTime() > now
  ) {
    throw new AppError(400, "Assessment has not started yet");
  }

  if (
    assessment.endsAt &&
    new Date(assessment.endsAt).getTime() <= now
  ) {
    throw new AppError(400, "Assessment has already ended");
  }

  const invitation = await db.orm.public.Invitation
    .where({
      assessmentId: payload.assessmentId,
      candidateId,
    })
    .first();

  if (!invitation) {
    throw new AppError(403, "You are not invited to this assessment");
  }

  if (invitation.status !== "ACCEPTED") {
    throw new AppError(
      403,
      "You must accept the invitation before starting the assessment",
    );
  }

  if (
    invitation.expiresAt &&
    new Date(invitation.expiresAt).getTime() <= now
  ) {
    await db.orm.public.Invitation
      .where({ id: invitation.id })
      .update({ status: "EXPIRED" });

    throw new AppError(400, "Assessment invitation has expired");
  }

  return db.transaction(async (tx) => {
    const attempts = await tx.orm.public.Attempt
      .where({
        assessmentId: payload.assessmentId,
        candidateId,
      })
      .all();

    const activeAttempt = attempts.find(
      (attempt) => attempt.status === "IN_PROGRESS",
    );

    if (activeAttempt) {
      return activeAttempt;
    }

    const completedAttempts = attempts.filter(
      (attempt) =>
        attempt.status === "SUBMITTED" || attempt.status === "EXPIRED",
    );

    if (completedAttempts.length >= assessment.maxAttempts) {
      throw new AppError(400, "Maximum attempt limit has been reached");
    }

    const attemptNumber = attempts.length + 1;
    const startedAt = new Date();
    const expiresAt = new Date(
      startedAt.getTime() + assessment.durationMinutes * 60 * 1000,
    );

    if (
      assessment.endsAt &&
      expiresAt.getTime() > new Date(assessment.endsAt).getTime()
    ) {
      expiresAt.setTime(new Date(assessment.endsAt).getTime());
    }

    try {
      return await tx.orm.public.Attempt.create({
        assessmentId: payload.assessmentId,
        candidateId,
        attemptNumber,
        status: "IN_PROGRESS",
        startedAt: startedAt.toISOString(),
        expiresAt: expiresAt.toISOString(),
      });
    } catch (error) {
      throw new AppError(
        409,
        "Unable to start attempt because another attempt was created concurrently",
      );
    }
  });
};

const getMyAttempt = async (
  attemptId: number,
  candidateId: number,
) => {
  const attempt = await db.orm.public.Attempt
    .where({ id: attemptId })
    .first();

  if (!attempt || attempt.candidateId !== candidateId) {
    throw new AppError(404, "Attempt not found");
  }

  return attempt;
};

const submitAttempt = async (
  attemptId: number,
  candidateId: number,
) => {
  const attempt = await db.orm.public.Attempt
    .where({ id: attemptId })
    .first();

  if (!attempt || attempt.candidateId !== candidateId) {
    throw new AppError(404, "Attempt not found");
  }

  if (attempt.status !== "IN_PROGRESS") {
    throw new AppError(
      400,
      `Attempt cannot be submitted because its status is ${attempt.status}`,
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

  const assessment = await db.orm.public.Assessment
    .where({ id: attempt.assessmentId })
    .first();

  if (!assessment || assessment.deletedAt) {
    throw new AppError(404, "Assessment not found");
  }

  const assessmentQuestions = await db.orm.public.AssessmentQuestion
    .where({ assessmentId: attempt.assessmentId })
    .all();

  if (assessmentQuestions.length === 0) {
    throw new AppError(400, "Assessment has no questions");
  }

  const submissions = await db.orm.public.Submission
    .where({ attemptId: attempt.id })
    .all();

  let totalScore = 0;
  let maxScore = 0;
  let hasPendingEvaluation = false;

  const evaluatedSubmissions: Array<{
    id: number;
    score: number;
    feedback: string;
  }> = [];

  for (const assessmentQuestion of assessmentQuestions) {
    const question = await db.orm.public.Question
      .where({ id: assessmentQuestion.questionId })
      .first();

    if (!question || question.deletedAt) {
      continue;
    }

    const marks = assessmentQuestion.marksOverride ?? question.marks;
    maxScore += marks;

    const submission = submissions.find(
      (item) =>
        item.assessmentQuestionId === assessmentQuestion.id,
    );

    if (!submission) {
      continue;
    }

    if (submission.status !== "PENDING") {
      if (submission.score !== null && submission.score !== undefined) {
        totalScore += submission.score;
      }
      continue;
    }

    if (question.type === "MCQ") {
      const isCorrect =
        normalizeAnswer(submission.answer) ===
        normalizeAnswer(question.expectedAnswer);

      const score = isCorrect ? marks : 0;

      evaluatedSubmissions.push({
        id: submission.id,
        score,
        feedback: isCorrect ? "Correct answer" : "Incorrect answer",
      });

      totalScore += score;
    } else {
      hasPendingEvaluation = true;
    }
  }

  const percentage =
    maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

  const passingScore = assessment.passingScore ?? 0;

  const passed =
    !hasPendingEvaluation &&
    percentage >= passingScore;

  const submittedAt = new Date().toISOString();

  return db.transaction(async (tx) => {
    for (const submission of evaluatedSubmissions) {
      await tx.orm.public.Submission
        .where({ id: submission.id })
        .update({
          score: submission.score,
          feedback: submission.feedback,
          status: "EVALUATED",
          evaluatedAt: submittedAt,
          updatedAt: submittedAt,
        });
    }

    await tx.orm.public.Attempt
      .where({ id: attempt.id })
      .update({
        status: "SUBMITTED",
        submittedAt,
        score: totalScore,
      });

    const existingResult = await tx.orm.public.Result
      .where({ attemptId: attempt.id })
      .first();

    let result;

    if (existingResult) {
      result = await tx.orm.public.Result
        .where({ attemptId: attempt.id })
        .update({
          totalScore,
          maxScore,
          percentage,
          passed,
          updatedAt: submittedAt,
        });
    } else {
      result = await tx.orm.public.Result.create({
        attemptId: attempt.id,
        totalScore,
        maxScore,
        percentage,
        passed,
        updatedAt: submittedAt,
      });
    }

    return {
      attemptId: attempt.id,
      status: "SUBMITTED",
      totalScore,
      maxScore,
      percentage,
      passed,
      result,
    };
  });
};

export const AttemptServices = {
  startAttempt,
  getMyAttempt,
  submitAttempt,
};
