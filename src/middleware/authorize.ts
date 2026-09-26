import { NextFunction, Response } from "express";
import {
  AuthenticatedRequest,
  UserRole,
} from "./auth.js";

const authorize = (...allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
        errors: [],
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: [],
      });
    }

    next();
  };
};

export default authorize;
