import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type UserRole = "ADMIN" | "COMPANY" | "CANDIDATE";

export interface AuthUser {
  id: number;
  name: string;
  role: UserRole;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const auth = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: [],
      });
    }

    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7)
      : authorization;

    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      throw new Error("JWT_ACCESS_SECRET is not configured");
    }

    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.id !== "number" ||
      typeof decoded.name !== "string" ||
      (decoded.role !== "ADMIN" && decoded.role !== "COMPANY" && decoded.role !== "CANDIDATE")
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
        errors: [],
      });
    }

    req.user = {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role,
    };

    next();
  } catch {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired JWT token",
      errors: [],
    });
  }
};

export default auth;
