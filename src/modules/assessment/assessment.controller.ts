import { Request, Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import sendResponse from "../../utils/sendResponse.js";
import { AssessmentServices } from "./assessment.service.js";

const createAssessment = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const result = await AssessmentServices.createAssessment(
    req.body,
    req.user!.id,
    req.user!.role as "ADMIN" | "COMPANY",
  );

  return sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Assessment created successfully",
    data: result,
  });
};

const getAllAssessments = async (
  _req: Request,
  res: Response,
) => {
  const result = await AssessmentServices.getAllAssessments({ page: Number(_req.query.page) || 1, limit: Number(_req.query.limit) || 10, search: _req.query.search as string, status: _req.query.status as string, sort: _req.query.sort as "asc" | "desc" });

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assessments retrieved successfully",
    data: result,
  });
};

const getSingleAssessment = async (
  req: Request,
  res: Response,
) => {
  const result = await AssessmentServices.getSingleAssessment(
    Number(req.params.id),
  );

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assessment retrieved successfully",
    data: result,
  });
};

const updateAssessment = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const result = await AssessmentServices.updateAssessment(
    Number(req.params.id),
    req.body,
    req.user!.id,
    req.user!.role as "ADMIN" | "COMPANY",
  );

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assessment updated successfully",
    data: result,
  });
};

const publishAssessment = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const result = await AssessmentServices.publishAssessment(
    Number(req.params.id),
    req.user!.id,
    req.user!.role as "ADMIN" | "COMPANY",
  );

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assessment published successfully",
    data: result,
  });
};

const deleteAssessment = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  await AssessmentServices.deleteAssessment(
    Number(req.params.id),
    req.user!.id,
    req.user!.role as "ADMIN" | "COMPANY",
  );

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Assessment deleted successfully",
    includeData: false,
  });
};

export const AssessmentControllers = {
  createAssessment,
  getAllAssessments,
  getSingleAssessment,
  updateAssessment,
  publishAssessment,
  deleteAssessment,
};
