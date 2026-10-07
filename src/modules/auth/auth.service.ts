import bcrypt from "bcrypt";
import createRefreshToken from "../../utils/refreshToken.js";
import hashToken from "../../utils/hashToken.js";
import { db } from "../../prisma/db.js";
import createAccessToken from "../../utils/jwt.js";
import AppError from "../../utils/AppError.js";

type UserRole = "ADMIN" | "COMPANY" | "CANDIDATE";

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

const registerUser = async (payload: RegisterPayload) => {
  const existingUser = await db.orm.public.User
    .where({ email: payload.email })
    .first();

  if (existingUser) {
    throw new AppError(400, "User already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 12);
  const role: UserRole = "CANDIDATE";

  try {
    const user = await db.orm.public.User.create({
      name: payload.name,
      email: payload.email,
      passwordHash: hashedPassword,
      role,
    });

    const { passwordHash: _password, ...safeUser } = user;

    return safeUser;
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
  const user = await db.orm.public.User
    .where({ email: payload.email })
    .first();

  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  if (!user.passwordHash) {
    throw new AppError(401, "Password login is not available for this account");
  }

  const passwordMatched = await bcrypt.compare(
    payload.password,
    user.passwordHash,
  );

  if (!passwordMatched) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = createAccessToken({
    id: user.id,
    name: user.name,
    role: user.role,
  });

  const refreshToken = createRefreshToken({
    id: user.id,
  });

  const tokenHash = hashToken(refreshToken);
  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  await db.orm.public.RefreshToken.create({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const { passwordHash: _password, ...safeUser } = user;

  return {
    accessToken: token,
    refreshToken,
    user: safeUser,
  };
};


const refreshAccessToken = async (refreshToken: string) => {
  const jwt = await import("jsonwebtoken");

  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  let payload: { id: number };

  try {
    payload = jwt.default.verify(refreshToken, secret) as { id: number };
  } catch {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  const tokenHash = hashToken(refreshToken);

  const storedToken = await db.orm.public.RefreshToken
    .where({ tokenHash })
    .first();

  if (!storedToken) {
    throw new AppError(401, "Invalid or expired refresh token");
  }

  if (storedToken.revokedAt) {
    throw new AppError(401, "Refresh token has been revoked");
  }

  if (new Date(storedToken.expiresAt).getTime() <= Date.now()) {
    throw new AppError(401, "Refresh token has expired");
  }

  const user = await db.orm.public.User
    .where({ id: payload.id })
    .first();

  if (!user || user.deletedAt || user.status !== "ACTIVE") {
    throw new AppError(401, "User account is not active");
  }

  if (!user) {
    throw new AppError(500, "Failed to create or retrieve Google user");
  }

  const accessToken = createAccessToken({
    id: user.id,
    name: user.name,
    role: user.role,
  });

  return {
    accessToken,
  };
};


const logoutUser = async (refreshToken: string) => {
  const tokenHash = hashToken(refreshToken);

  const storedToken = await db.orm.public.RefreshToken
    .where({ tokenHash })
    .first();

  if (!storedToken) {
    throw new AppError(401, "Invalid refresh token");
  }

  if (!storedToken.revokedAt) {
    await db.orm.public.RefreshToken
      .where({ id: storedToken.id })
      .update({ revokedAt: new Date().toISOString() });
  }

  return null;
};


const googleLogin = async (idToken: string) => {
  const { OAuth2Client } = await import("google-auth-library");

  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }

  const client = new OAuth2Client(clientId);

  let ticket;

  try {
    ticket = await client.verifyIdToken({
      idToken,
      audience: clientId,
    });
  } catch {
    throw new AppError(401, "Invalid Google ID token");
  }

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw new AppError(401, "Invalid Google account data");
  }

  if (!payload.email_verified) {
    throw new AppError(401, "Google email is not verified");
  }

  const googleId = payload.sub;
  const email = payload.email;
  const name = payload.name ?? email.split("@")[0];

  let user = await db.orm.public.User
    .where({ googleId })
    .first();

  if (!user) {
    user = await db.orm.public.User
      .where({ email })
      .first();
  }

  if (user) {
    if (user.deletedAt || user.status !== "ACTIVE") {
      throw new AppError(401, "User account is not active");
    }

    if (user.role !== "CANDIDATE") {
      throw new AppError(
        403,
        "Google login is available only for candidate accounts",
      );
    }

    if (!user.googleId) {
      user = await db.orm.public.User
        .where({ id: user.id })
        .update({ googleId });
    }
  } else {
    user = await db.orm.public.User.create({
      name,
      email,
      googleId,
      passwordHash: null,
      role: "CANDIDATE",
      status: "ACTIVE",
    });
  }

  if (!user) {
    throw new AppError(500, "Failed to create or retrieve Google user");
  }

  const accessToken = createAccessToken({
    id: user.id,
    name: user.name,
    role: user.role,
  });

  const refreshToken = createRefreshToken({
    id: user.id,
  });

  const tokenHash = hashToken(refreshToken);

  const expiresAt = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  await db.orm.public.RefreshToken.create({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const { passwordHash: _password, ...safeUser } = user;

  return {
    accessToken,
    refreshToken,
    user: safeUser,
  };
};


export const AuthServices = {
  registerUser,
  loginUser,
  googleLogin,
  refreshAccessToken,
  logoutUser,
};
