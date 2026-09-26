import { Router } from "express";
import validateRequest from "../middleware/validateRequest.js";
import { AuthControllers } from "../modules/auth/auth.controller.js";
import {
  loginSchema,
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

export default router;
