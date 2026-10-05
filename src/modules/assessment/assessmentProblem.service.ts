import pool from "../../config/db.js";
import AppError from "../../utils/AppError.js";

interface AddProblemPayload {
  problemId: number;
  position: number;
  marksOverride?: number;
}

const addProblemToAssessment = async (
  assessmentId: number,
  payload: AddProblemPayload,
) => {
  const assessmentResult = await pool.query(
    `SELECT id
     FROM assessment
     WHERE id = $1
       AND "deletedAt" IS NULL
     LIMIT 1`,
    [assessmentId],
  );

  if (assessmentResult.rows.length === 0) {
    throw new AppError(404, "Assessment not found");
  }

  const problemResult = await pool.query(
    `SELECT id
     FROM problem
     WHERE id = $1
       AND "deletedAt" IS NULL
     LIMIT 1`,
    [payload.problemId],
  );

  if (problemResult.rows.length === 0) {
    throw new AppError(404, "Problem not found");
  }

  const existingProblem = await pool.query(
    `SELECT id
     FROM "assessmentProblem"
     WHERE "assessmentId" = $1
       AND "problemId" = $2
     LIMIT 1`,
    [assessmentId, payload.problemId],
  );

  if (existingProblem.rows.length > 0) {
    throw new AppError(400, "Problem is already added to this assessment");
  }

  const existingPosition = await pool.query(
    `SELECT id
     FROM "assessmentProblem"
     WHERE "assessmentId" = $1
       AND "order" = $2
     LIMIT 1`,
    [assessmentId, payload.position],
  );

  if (existingPosition.rows.length > 0) {
    throw new AppError(400, "This position is already used in the assessment");
  }

  const result = await pool.query(
    `INSERT INTO "assessmentProblem"
      ("assessmentId", "problemId", "order", "marksOverride")
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [
      assessmentId,
      payload.problemId,
      payload.position,
      payload.marksOverride ?? null,
    ],
  );

  return result.rows[0];
};

const getAssessmentProblems = async (assessmentId: number) => {
  const assessmentResult = await pool.query(
    `SELECT id
     FROM assessment
     WHERE id = $1
       AND "deletedAt" IS NULL
     LIMIT 1`,
    [assessmentId],
  );

  if (assessmentResult.rows.length === 0) {
    throw new AppError(404, "Assessment not found");
  }

  const result = await pool.query(
    `SELECT
       ap.id,
       ap."assessmentId",
       ap."problemId",
       ap."order",
       ap."marksOverride",
       p.type,
       p.title,
       p.description,
       p.points,
       p.options,
       p."correctAnswer",
       p.solution,
       p."testCases"
     FROM "assessmentProblem" ap
     INNER JOIN problem p
       ON p.id = ap."problemId"
     WHERE ap."assessmentId" = $1
       AND p."deletedAt" IS NULL
     ORDER BY ap."order" ASC`,
    [assessmentId],
  );

  return result.rows;
};

export const AssessmentProblemServices = {
  addProblemToAssessment,
  getAssessmentProblems,
};
