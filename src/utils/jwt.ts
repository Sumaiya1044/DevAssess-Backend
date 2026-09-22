import jwt, { SignOptions } from "jsonwebtoken";

interface JwtPayload {
  id: number;
  email: string;
  role: string;
}

const createAccessToken = (payload: JwtPayload): string => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new Error("JWT_ACCESS_SECRET is not configured");
  }

  const expiresIn = (process.env.JWT_ACCESS_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

  return jwt.sign(payload, secret, {
    expiresIn,
  });
};

export default createAccessToken;
