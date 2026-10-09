import { Router } from "express";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/role.js";
import validateRequest from "../middleware/validateRequest.js";
import { getAllAuditLogsController } from "../modules/auditLog.controller.js";
import { auditLogQuerySchema } from "../modules/auditLog.validation.js";

const router = Router();

router.get(
  "/",
  auth,
  requireRole("ADMIN"),
  validateRequest(auditLogQuerySchema),
  getAllAuditLogsController,
);

export default router;
