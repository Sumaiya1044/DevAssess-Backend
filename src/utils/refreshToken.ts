import jwt, { SignOptions } from "jsonwebtoken";

interface RefreshTokenPayload {
  id: number;
}

const createRefreshToken = (payload: RefreshTokenPayload): string => {
  const secret = process.env.JWT_REFRESH_SECRET;

  if (!secret) {
    throw new Error("JWT_REFRESH_SECRET is not configured");
  }

  const expiresIn = (process.env.JWT_REFRESH_EXPIRES_IN || "30d") as SignOptions["expiresIn"];

  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

export default createRefreshToken;
