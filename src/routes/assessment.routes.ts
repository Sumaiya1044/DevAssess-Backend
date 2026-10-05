import { Router } from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import validateRequest from "../middleware/validateRequest.js";
import { AssessmentControllers } from "../modules/assessment/assessment.controller.js";
import { AssessmentValidations } from "../modules/assessment/assessment.validation.js";
import { AssessmentProblemControllers } from "../modules/assessment/assessmentProblem.controller.js";
import { AssessmentProblemValidations } from "../modules/assessment/assessmentProblem.validation.js";

const router = Router();

router.post(
  "/:id/problems",
  auth,
  authorize("ADMIN", "COMPANY"),
  validateRequest(AssessmentProblemValidations.addProblemToAssessmentSchema),
  AssessmentProblemControllers.addProblemToAssessment,
);

router.get(
  "/:id/problems",
  validateRequest(AssessmentValidations.assessmentIdSchema),
  AssessmentProblemControllers.getAssessmentProblems,
);

router.post(
  "/",
  auth,
  authorize("ADMIN", "COMPANY"),
  validateRequest(AssessmentValidations.createAssessmentSchema),
  AssessmentControllers.createAssessment,
);

router.get(
  "/",
  AssessmentControllers.getAllAssessments,
);

router.get(
  "/:id",
  validateRequest(AssessmentValidations.assessmentIdSchema),
  AssessmentControllers.getSingleAssessment,
);

router.post(
  "/:id/publish",
  auth,
  authorize("ADMIN", "COMPANY"),
  validateRequest(AssessmentValidations.assessmentIdSchema),
  AssessmentControllers.publishAssessment,
);

router.patch(
  "/:id",
  auth,
  authorize("ADMIN", "COMPANY"),
  validateRequest(AssessmentValidations.updateAssessmentSchema),
  AssessmentControllers.updateAssessment,
);

router.delete(
  "/:id",
  auth,
  authorize("ADMIN", "COMPANY"),
  validateRequest(AssessmentValidations.assessmentIdSchema),
  AssessmentControllers.deleteAssessment,
);

export default router;
