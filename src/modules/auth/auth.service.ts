import bcrypt from "bcrypt";
import pool from "../../config/db.js";
import createAccessToken from "../../utils/jwt.js";
import AppError from "../../utils/AppError.js";

type UserRole = "contributor" | "maintainer";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

interface LoginPayload {
  email: string;
  password: string;
}

const registerUser = async (payload: RegisterPayload) => {
  const existingUser = await pool.query<{ id: number }>(
    "SELECT id FROM users WHERE email = $1 LIMIT 1",
    [payload.email],
  );

  if (existingUser.rows.length > 0) {
    throw new AppError(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const role: UserRole = payload.role ?? "contributor";

  try {
    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at, updated_at`,
      [payload.name, payload.email, hashedPassword, role],
    );

    return result.rows[0];
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      throw new AppError(400, "User already exists");
    }

    throw error;
  }
};

const loginUser = async (payload: LoginPayload) => {
  const result = await pool.query<{
    id: number;
    name: string;
    email: string;
    password: string;
    role: UserRole;
    created_at: string;
    updated_at: string;
  }>(
    `SELECT id, name, email, password, role, created_at, updated_at
     FROM users
     WHERE email = $1
     LIMIT 1`,
    [payload.email],
  );

  if (result.rows.length === 0) {
    throw new AppError(401, "Invalid email or password");
  }

  const user = result.rows[0];

  const passwordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!passwordMatched) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = createAccessToken({
    id: user.id,
    name: user.name,
    role: user.role,
  });

  const { password: _password, ...safeUser } = user;

  return {
    token,
    user: safeUser,
  };
};

export const AuthServices = {
  registerUser,
  loginUser,
};
