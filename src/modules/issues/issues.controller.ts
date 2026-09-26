import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import sendResponse from "../../utils/sendResponse.js";
import { IssueServices } from "./issues.service.js";

const createIssue = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const result = await IssueServices.createIssue({
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    reporterId: req.user!.id,
  });

  return sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Issue created successfully",
    data: result,
  });
};

const getAllIssues = async (req: Request, res: Response) => {
  const result = await IssueServices.getAllIssues({
    sort: req.query.sort as "newest" | "oldest" | undefined,
    type: req.query.type as "bug" | "feature_request" | undefined,
    status: req.query.status as
      | "open"
      | "in_progress"
      | "resolved"
      | undefined,
  });

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Issues retrived successfully",
    data: result,
  });
};

const getSingleIssue = async (req: Request, res: Response) => {
  const result = await IssueServices.getSingleIssue(
    Number(req.params.id),
  );

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Issue retrived successfully",
    data: result,
  });
};

const updateIssue = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const result = await IssueServices.updateIssue(
    Number(req.params.id),
    req.body,
    req.user!.id,
    req.user!.role,
  );

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Issue updated successfully",
    data: result,
  });
};

const deleteIssue = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  await IssueServices.deleteIssue(Number(req.params.id));

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Issue deleted successfully",
    includeData: false,
  });
};

export const IssueControllers = {
  createIssue,
  getAllIssues,
  getSingleIssue,
  updateIssue,
  deleteIssue,
};
