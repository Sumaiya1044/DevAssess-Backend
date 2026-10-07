import { Response, NextFunction } from "express";
import { AuthenticatedRequest, UserRole } from "./auth.js";

const requireRole = (...allowedRoles: UserRole[]) => {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
        errors: [],
      });
    }

    next();
  };
};

export default requireRole;
