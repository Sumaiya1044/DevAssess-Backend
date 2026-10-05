import { Router } from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import validateRequest from "../middleware/validateRequest.js";
import { AttemptControllers } from "../modules/attempt/attempt.controller.js";
import { AttemptValidations } from "../modules/attempt/attempt.validation.js";

const router = Router();

router.post(
  "/start",
  auth,
  authorize("CANDIDATE"),
  validateRequest(AttemptValidations.startAttemptSchema),
  AttemptControllers.startAttempt,
);

router.post(
  "/:id/submit",
  auth,
  authorize("CANDIDATE"),
  validateRequest(AttemptValidations.attemptIdSchema),
  AttemptControllers.submitAttempt,
);

router.get(
  "/:id",
  auth,
  authorize("CANDIDATE"),
  validateRequest(AttemptValidations.attemptIdSchema),
  AttemptControllers.getMyAttempt,
);

export default router;
