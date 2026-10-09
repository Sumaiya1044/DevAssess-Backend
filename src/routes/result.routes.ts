import { Router } from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import validateRequest from "../middleware/validateRequest.js";
import { ResultControllers } from "../modules/result/result.controller.js";
import { ResultValidations } from "../modules/result/result.validation.js";

const router = Router();

router.get(
  "/attempt/:attemptId",
  auth,
  authorize("CANDIDATE"),
  validateRequest(ResultValidations.attemptIdSchema),
  ResultControllers.getMyResultByAttempt,
);

router.get(
  "/:id",
  auth,
  authorize("CANDIDATE"),
  validateRequest(ResultValidations.resultIdSchema),
  ResultControllers.getMyResult,
);

export default router;
