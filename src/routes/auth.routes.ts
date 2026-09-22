import { Router } from "express";
import { AuthControllers } from "../modules/auth/auth.controller.js";
import validateRequest from "../middleware/validateRequest.js";
import auth from "../middleware/auth.js";
import {
  registerSchema,
  loginSchema,
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

router.get("/me", auth, AuthControllers.getMe);

export default router;
