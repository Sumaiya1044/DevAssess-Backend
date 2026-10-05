import { Router } from "express";
import validateRequest from "../middleware/validateRequest.js";
import { AuthControllers } from "../modules/auth/auth.controller.js";
import {
  loginSchema,
  refreshTokenSchema,
  registerSchema,
} from "../modules/auth/auth.validation.js";

const router = Router();

router.post(
  "/signup",
  validateRequest(registerSchema),
  AuthControllers.signup,
);

router.post(
  "/login",
  validateRequest(loginSchema),
  AuthControllers.login,
);

router.post(
  "/refresh-token",
  validateRequest(refreshTokenSchema),
  AuthControllers.refreshToken,
);

router.post(
  "/logout",
  validateRequest(refreshTokenSchema),
  AuthControllers.logout,
);

export default router;
