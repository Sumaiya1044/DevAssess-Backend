import { Router } from "express";
import validateRequest from "../middleware/validateRequest.js";
import { AuthControllers } from "../modules/auth/auth.controller.js";
import { GoogleAuthControllers } from "../modules/auth/google.controller.js";
import {
  googleLoginSchema,
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
  "/google",
  validateRequest(googleLoginSchema),
  AuthControllers.googleLogin,
);

router.get(
  "/google",
  GoogleAuthControllers.startGoogleLogin,
);

router.get(
  "/google/callback",
  GoogleAuthControllers.googleCallback,
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
