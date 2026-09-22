import { NextFunction, Response } from "express";
import {
  AuthenticatedRequest,
} from "./auth.js";

const authorize = (...allowedRoles: string[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        errors: [],
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You do not have permission to access this resource",
        errors: [],
      });
    }

    next();
  };
};

export default authorize;
