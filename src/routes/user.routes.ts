import { Router } from "express";
import { UserControllers } from "../modules/user/user.controller.js";
import {
  updateMyProfileSchema,
  updateUserRoleSchema,
} from "../modules/user/user.validation.js";
import auth from "../middleware/auth.js";
import requireRole from "../middleware/role.js";
import validateRequest from "../middleware/validateRequest.js";

const router = Router();

router.get(
  "/me",
  auth,
  UserControllers.getMyProfile,
);

router.patch(
  "/me",
  auth,
  validateRequest(updateMyProfileSchema),
  UserControllers.updateMyProfile,
);

router.get(
  "/admin",
  auth,
  requireRole("ADMIN"),
  UserControllers.getAllUsersForAdmin,
);

router.patch(
  "/admin/:id/role",
  auth,
  requireRole("ADMIN"),
  validateRequest(updateUserRoleSchema),
  UserControllers.updateUserRoleForAdmin,
);

export default router;
