import { Router } from "express";
import { AuthControllers } from "../modules/auth/auth.controller.js";
import validateRequest from "../middleware/validateRequest.js";
import auth from "../middleware/auth.js";
import {
  registerSchema,
  loginSchema,
  googleLoginSchema,
} from "../modules/auth/auth.validation.js";

const router = Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  AuthControllers.register,
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

router.get("/me", auth, AuthControllers.getMe);

export default router;
