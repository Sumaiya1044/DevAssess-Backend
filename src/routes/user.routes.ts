import { Router } from "express";
import { UserControllers } from "../modules/user/user.controller.js";
import { updateMyProfileSchema } from "../modules/user/user.validation.js";
import auth from "../middleware/auth.js";
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

export default router;
