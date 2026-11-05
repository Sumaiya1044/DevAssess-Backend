
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

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
        message: "Authorization header is required",
        errors: [],
      });
    }

    if (!authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Bearer token is required",
        errors: [],
      });
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Bearer token is required",
        errors: [],
      });
    }

    const secret = process.env.JWT_ACCESS_SECRET;

    if (!secret) {
      console.error("JWT_ACCESS_SECRET is not configured");

      return res.status(500).json({
        success: false,
        message: "Authentication configuration error",
        errors: [],
      });
    }

    const decoded = jwt.verify(token, secret);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof (decoded as JwtPayload).id !== "number" ||
      typeof (decoded as JwtPayload).name !== "string" ||
      !["ADMIN", "COMPANY", "CANDIDATE"].includes(
        String((decoded as JwtPayload).role),
      )
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token",
        errors: [],
      });
    }

    const payload = decoded as JwtPayload;

    req.user = {
      id: payload.id as number,
      name: payload.name as string,
      role: payload.role as UserRole,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        success: false,
        message: "JWT token has expired. Please login again.",
        errors: [],
      });
    }

    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({
        success: false,
        message: "Invalid JWT token",
        errors: [],
      });
    }

    console.error("Authentication middleware error");

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: [],
    });
  }
};

export default auth;
