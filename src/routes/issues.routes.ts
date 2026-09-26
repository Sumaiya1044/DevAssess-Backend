import { Router } from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import validateRequest from "../middleware/validateRequest.js";
import { IssueControllers } from "../modules/issues/issues.controller.js";
import {
  createIssueSchema,
  getIssuesSchema,
  issueIdSchema,
  updateIssueSchema,
} from "../modules/issues/issues.validation.js";

const router = Router();

router.post(
  "/",
  auth,
  authorize("contributor", "maintainer"),
  validateRequest(createIssueSchema),
  IssueControllers.createIssue,
);

router.get(
  "/",
  validateRequest(getIssuesSchema),
  IssueControllers.getAllIssues,
);

router.get(
  "/:id",
  validateRequest(issueIdSchema),
  IssueControllers.getSingleIssue,
);

router.patch(
  "/:id",
  auth,
  authorize("contributor", "maintainer"),
  validateRequest(updateIssueSchema),
  IssueControllers.updateIssue,
);

router.delete(
  "/:id",
  auth,
  authorize("maintainer"),
  validateRequest(issueIdSchema),
  IssueControllers.deleteIssue,
);

export default router;
