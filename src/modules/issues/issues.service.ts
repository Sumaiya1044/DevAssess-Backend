import { QueryResultRow } from "pg";
import pool from "../../config/db.js";
import AppError from "../../utils/AppError.js";
import { UserRole } from "../../middleware/auth.js";

type IssueType = "bug" | "feature_request";
type IssueStatus = "open" | "in_progress" | "resolved";

interface IssueRow extends QueryResultRow {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: string;
  updated_at: string;
}

interface ReporterRow extends QueryResultRow {
  id: number;
  name: string;
  role: UserRole;
}

interface CreateIssuePayload {
  title: string;
  description: string;
  type: IssueType;
  reporterId: number;
}

interface UpdateIssuePayload {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
}

interface ListIssuesFilters {
  sort?: "newest" | "oldest";
  type?: IssueType;
  status?: IssueStatus;
}

const getReporter = async (reporterId: number) => {
  const result = await pool.query<ReporterRow>(
    "SELECT id, name, role FROM users WHERE id = $1 LIMIT 1",
    [reporterId],
  );

  return result.rows[0] ?? null;
};

const createIssue = async (payload: CreateIssuePayload) => {
  const reporter = await getReporter(payload.reporterId);

  if (!reporter) {
    throw new AppError(404, "Reporter not found");
  }

  const result = await pool.query<IssueRow>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [
      payload.title,
      payload.description,
      payload.type,
      payload.reporterId,
    ],
  );

  return result.rows[0];
};

const getAllIssues = async (filters: ListIssuesFilters) => {
  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (filters.type) {
    values.push(filters.type);
    conditions.push(`type = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const orderBy =
    filters.sort === "oldest" ? "created_at ASC" : "created_at DESC";

  const result = await pool.query<IssueRow>(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues
     ${whereClause}
     ORDER BY ${orderBy}`,
    values,
  );

  const issues = await Promise.all(
    result.rows.map(async (issue) => {
      const reporter = await getReporter(issue.reporter_id);

      return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,
        reporter:
          reporter ?? {
            id: issue.reporter_id,
            name: "Unknown",
            role: "contributor" as UserRole,
          },
        created_at: issue.created_at,
        updated_at: issue.updated_at,
      };
    }),
  );

  return issues;
};

const getSingleIssue = async (issueId: number) => {
  const result = await pool.query<IssueRow>(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues
     WHERE id = $1
     LIMIT 1`,
    [issueId],
  );

  if (result.rows.length === 0) {
    throw new AppError(404, "Issue not found");
  }

  const issue = result.rows[0];
  const reporter = await getReporter(issue.reporter_id);
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporter ?? {
      id: issue.reporter_id,
      name: "Unknown",
      role: "CANDIDATE" as UserRole,
    },
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
};

const updateIssue = async (
  issueId: number,
  payload: UpdateIssuePayload,
  userId: number,
  userRole: UserRole,
) => {
  const existingResult = await pool.query<IssueRow>(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues
     WHERE id = $1
     LIMIT 1`,
    [issueId],
  );

  if (existingResult.rows.length === 0) {
    throw new AppError(404, "Issue not found");
  }

  const existingIssue = existingResult.rows[0];

  if (userRole === "COMPANY") {
    if (existingIssue.reporter_id !== userId) {
      throw new AppError(403, "Forbidden");
    }

    if (existingIssue.status !== "open") {
      throw new AppError(
        409,
        "Only open issues can be updated by companies",
      );
    }

    if (payload.status !== undefined) {
      throw new AppError(
        403,
        "Companies cannot change issue status",
      );
    }
  }

  const fields: string[] = [];
  const values: (string | number)[] = [];

  if (payload.title !== undefined) {
    values.push(payload.title);
    fields.push(`title = $${values.length}`);
  }

  if (payload.description !== undefined) {
    values.push(payload.description);
    fields.push(`description = $${values.length}`);
  }

  if (payload.type !== undefined) {
    values.push(payload.type);
    fields.push(`type = $${values.length}`);
  }

  if (payload.status !== undefined) {
    if (userRole !== "ADMIN") {
      throw new AppError(
        403,
        "Only admins can change issue status",
      );
    }

    values.push(payload.status);
    fields.push(`status = $${values.length}`);
  }

  if (fields.length === 0) {
    throw new AppError(400, "No fields provided for update");
  }

  values.push(issueId);

  const result = await pool.query<IssueRow>(
    `UPDATE issues
     SET ${fields.join(", ")}
     WHERE id = $${values.length}
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    values,
  );

  return result.rows[0];
};

const deleteIssue = async (issueId: number) => {
  const result = await pool.query<{ id: number }>(
    "DELETE FROM issues WHERE id = $1 RETURNING id",
    [issueId],
  );

  if (result.rows.length === 0) {
    throw new AppError(404, "Issue not found");
  }
};

export const IssueServices = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
