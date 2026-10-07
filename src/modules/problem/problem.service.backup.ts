import { QueryResultRow } from "pg";
import pool from "../../config/db.js";
import AppError from "../../utils/AppError.js";

type ProblemType = "MCQ" | "WRITTEN" | "CODING";

interface ProblemRow extends QueryResultRow {
  id: number;
  companyId: number;
  createdById: number;
  type: ProblemType;
  title: string;
  description: string;
  points: number;
  options: unknown;
  correctAnswer: unknown;
  solution: string | null;
  testCases: unknown;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface CreateProblemPayload {
  companyId: number;
  type: ProblemType;
  title: string;
  description: string;
  marks?: number;
  options?: unknown;
  expectedAnswer?: unknown;
  solution?: string;
  testCases?: unknown;
}

interface UpdateProblemPayload {
  type?: ProblemType;
  title?: string;
  description?: string;
  marks?: number;
  options?: unknown;
  expectedAnswer?: unknown;
  solution?: string;
  testCases?: unknown;
}

const createProblem = async (
  payload: CreateProblemPayload,
  createdById: number,
  creatorRole: "ADMIN" | "COMPANY",
) => {
  const companyResult = await pool.query(
    `SELECT id, "ownerId"
     FROM company
     WHERE id = $1
       AND "deletedAt" IS NULL
     LIMIT 1`,
    [payload.companyId],
  );

  if (companyResult.rows.length === 0) {
    throw new AppError(404, "Company not found");
  }

  if (
    creatorRole === "COMPANY" &&
    companyResult.rows[0].ownerId !== createdById
  ) {
    throw new AppError(403, "You can only create problems for your own company");
  }

  const result = await pool.query<ProblemRow>(
    `INSERT INTO problem
      ("companyId", "createdById", type, title, description, points,
       "correctAnswer", options, solution, "testCases")
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      payload.companyId,
      createdById,
      payload.type,
      payload.title,
      payload.description,
      payload.marks ?? 1,
      payload.expectedAnswer ?? null,
      payload.options ?? null,
      payload.solution ?? null,
      payload.testCases ?? null,
    ],
  );

  return result.rows[0];
};

const getSingleProblem = async (problemId: number) => {
  const result = await pool.query<ProblemRow>(
    `SELECT *
     FROM problem
     WHERE id = $1
       AND "deletedAt" IS NULL
     LIMIT 1`,
    [problemId],
  );

  if (result.rows.length === 0) {
    throw new AppError(404, "Problem not found");
  }

  return result.rows[0];
};

const updateProblem = async (
  problemId: number,
  payload: UpdateProblemPayload,
) => {
  await getSingleProblem(problemId);

  const fields: string[] = [];
  const values: unknown[] = [];

  if (payload.type !== undefined) {
    values.push(payload.type);
    fields.push(`type = $${values.length}`);
  }

  if (payload.title !== undefined) {
    values.push(payload.title);
    fields.push(`title = $${values.length}`);
  }

  if (payload.description !== undefined) {
    values.push(payload.description);
    fields.push(`description = $${values.length}`);
  }

  if (payload.marks !== undefined) {
    values.push(payload.marks);
    fields.push(`points = $${values.length}`);
  }

  if (payload.options !== undefined) {
    values.push(payload.options);
    fields.push(`options = $${values.length}`);
  }

  if (payload.expectedAnswer !== undefined) {
    values.push(payload.expectedAnswer);
    fields.push(`"correctAnswer" = $${values.length}`);
  }

  if (payload.solution !== undefined) {
    values.push(payload.solution);
    fields.push(`solution = $${values.length}`);
  }

  if (payload.testCases !== undefined) {
    values.push(payload.testCases);
    fields.push(`"testCases" = $${values.length}`);
  }

  if (fields.length === 0) {
    throw new AppError(400, "No fields provided for update");
  }

  values.push(problemId);

  const result = await pool.query<ProblemRow>(
    `UPDATE problem
     SET ${fields.join(", ")}
     WHERE id = $${values.length}
       AND "deletedAt" IS NULL
     RETURNING *`,
    values,
  );

  return result.rows[0];
};

const deleteProblem = async (problemId: number) => {
  await getSingleProblem(problemId);

  await pool.query(
    `UPDATE problem
     SET "deletedAt" = NOW()
     WHERE id = $1`,
    [problemId],
  );
};

export const ProblemServices = {
  createProblem,
  getSingleProblem,
  updateProblem,
  deleteProblem,
};
