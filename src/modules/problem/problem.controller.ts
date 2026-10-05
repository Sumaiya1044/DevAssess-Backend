import { Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import { ProblemServices } from "./problem.service.js";

const createProblem = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await ProblemServices.createProblem(
      req.body,
      req.user!.id,
      req.user!.role as "ADMIN" | "COMPANY",
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Problem created successfully",
      data: result,
    });
  },
);

const getSingleProblem = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await ProblemServices.getSingleProblem(
      Number(req.params.problemId),
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Problem retrieved successfully",
      data: result,
    });
  },
);

const updateProblem = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await ProblemServices.updateProblem(
      Number(req.params.problemId),
      req.body,
      req.user!.id,
      req.user!.role as "ADMIN" | "COMPANY",
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Problem updated successfully",
      data: result,
    });
  },
);

const deleteProblem = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    await ProblemServices.deleteProblem(
      Number(req.params.problemId),
      req.user!.id,
      req.user!.role as "ADMIN" | "COMPANY",
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Problem deleted successfully",
      data: null,
    });
  },
);

export const ProblemControllers = {
  createProblem,
  getSingleProblem,
  updateProblem,
  deleteProblem,
};
