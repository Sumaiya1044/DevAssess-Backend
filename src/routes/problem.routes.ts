import { Router } from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import validateRequest from "../middleware/validateRequest.js";
import { ProblemControllers } from "../modules/problem/problem.controller.js";
import { ProblemValidations } from "../modules/problem/problem.validation.js";

const router = Router();

router.post(
  "/",
  auth,
  authorize("ADMIN", "COMPANY"),
  validateRequest(ProblemValidations.createProblemSchema),
  ProblemControllers.createProblem,
);

router.get(
  "/:problemId",
  validateRequest(ProblemValidations.problemIdSchema),
  ProblemControllers.getSingleProblem,
);

router.patch(
  "/:problemId",
  auth,
  authorize("ADMIN", "COMPANY"),
  validateRequest(ProblemValidations.updateProblemSchema),
  ProblemControllers.updateProblem,
);

router.delete(
  "/:problemId",
  auth,
  authorize("ADMIN"),
  validateRequest(ProblemValidations.problemIdSchema),
  ProblemControllers.deleteProblem,
);

export default router;
