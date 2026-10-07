import { QueryResultRow } from "pg";
import pool from "../../config/db.js";
import AppError from "../../utils/AppError.js";

type AssessmentStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

interface AssessmentRow extends QueryResultRow {
  id: number;
  "companyId": number;
  "createdById": number;
  title: string;
  description: string | null;
  status: AssessmentStatus;
  "durationMinutes": number;
  "passingScore": number | null;
  "maxAttempts": number;
  price: number;
  "publishedAt": string | null;
  "startsAt": string | null;
  "endsAt": string | null;
  "deletedAt": string | null;
  "createdAt": string;
  "updatedAt": string;
}

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
  creatorRole: "ADMIN" | "COMPANY",
) => {
  const companyResult = await pool.query(
    `SELECT id, "ownerId" FROM company WHERE id = $1 AND "deletedAt" IS NULL LIMIT 1`,
    [payload.companyId],
  );

  if (companyResult.rows.length === 0) {
    throw new AppError(404, "Company not found");
  if (creatorRole === "COMPANY" && companyResult.rows[0].ownerId !== createdById) {
    throw new AppError(403, "You can only create assessments for your own company");
  }
  }

  const result = await pool.query<AssessmentRow>(
    `INSERT INTO assessment
      ("companyId", "createdById", title, description, "durationMinutes",
       "passingScore", "maxAttempts", price)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      payload.companyId,
      createdById,
      payload.title,
      payload.description ?? null,
      payload.durationMinutes,
      payload.passingScore ?? null,
      payload.maxAttempts ?? 1,
      payload.price ?? 0,
    ],
  );

  return result.rows[0];
};

const getAllAssessments = async () => {
  const result = await pool.query<AssessmentRow>(
    `SELECT *
     FROM assessment
     WHERE "deletedAt" IS NULL
     ORDER BY "createdAt" DESC`,
  );

  return result.rows;
};

const getSingleAssessment = async (assessmentId: number) => {
  const result = await pool.query<AssessmentRow>(
    `SELECT *
     FROM assessment
     WHERE id = $1
       AND "deletedAt" IS NULL
     LIMIT 1`,
    [assessmentId],
  );

  if (result.rows.length === 0) {
    throw new AppError(404, "Assessment not found");
  }

  return result.rows[0];
};

const updateAssessment = async (
  assessmentId: number,
  payload: UpdateAssessmentPayload,
) => {
  await getSingleAssessment(assessmentId);

  const fields: string[] = [];
  const values: (string | number | null)[] = [];

  if (payload.title !== undefined) {
    values.push(payload.title);
    fields.push(`title = $${values.length}`);
  }

  if (payload.description !== undefined) {
    values.push(payload.description);
    fields.push(`description = $${values.length}`);
  }

  if (payload.durationMinutes !== undefined) {
    values.push(payload.durationMinutes);
    fields.push(`"durationMinutes" = $${values.length}`);
  }

  if (payload.passingScore !== undefined) {
    values.push(payload.passingScore);
    fields.push(`"passingScore" = $${values.length}`);
  }

  if (payload.maxAttempts !== undefined) {
    values.push(payload.maxAttempts);
    fields.push(`"maxAttempts" = $${values.length}`);
  }

  if (payload.price !== undefined) {
    values.push(payload.price);
    fields.push(`price = $${values.length}`);
  }

  if (payload.startsAt !== undefined) {
    values.push(payload.startsAt);
    fields.push(`"startsAt" = $${values.length}`);
  }

  if (payload.endsAt !== undefined) {
    values.push(payload.endsAt);
    fields.push(`"endsAt" = $${values.length}`);
  }

  if (fields.length === 0) {
    throw new AppError(400, "No fields provided for update");
  }

  values.push(assessmentId);

  const result = await pool.query<AssessmentRow>(
    `UPDATE assessment
     SET ${fields.join(", ")}
     WHERE id = $${values.length}
       AND "deletedAt" IS NULL
     RETURNING *`,
    values,
  );

  return result.rows[0];
};

const deleteAssessment = async (assessmentId: number) => {
  await getSingleAssessment(assessmentId);

  await pool.query(
    `UPDATE assessment
     SET "deletedAt" = NOW()
     WHERE id = $1`,
    [assessmentId],
  );
};

export const AssessmentServices = {
  createAssessment,
  getAllAssessments,
  getSingleAssessment,
  updateAssessment,
  deleteAssessment,
};
