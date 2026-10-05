import { Router } from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import validateRequest from "../middleware/validateRequest.js";
import { SubmissionControllers } from "../modules/submission/submission.controller.js";
import { SubmissionValidations } from "../modules/submission/submission.validation.js";

const router = Router();

router.post(
  "/",
  auth,
  authorize("CANDIDATE"),
  validateRequest(SubmissionValidations.createSubmissionSchema),
  SubmissionControllers.createSubmission,
);

router.get(
  "/:id",
  auth,
  authorize("CANDIDATE"),
  validateRequest(SubmissionValidations.submissionIdSchema),
  SubmissionControllers.getMySubmission,
);

export default router;
