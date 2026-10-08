import { Router } from "express";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/role.js";
import { getAllAuditLogsController } from "../modules/auditLog.controller.js";

const router = Router();

router.get(
  "/",
  auth,
  requireRole("ADMIN"),
  getAllAuditLogsController,
);

export default router;
