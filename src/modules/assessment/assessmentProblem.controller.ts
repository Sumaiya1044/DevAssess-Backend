import { Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import { AssessmentProblemServices } from "./assessmentProblem.service.js";

const addProblemToAssessment = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await AssessmentProblemServices.addProblemToAssessment(
      Number(req.params.id),
      req.body,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Problem added to assessment successfully",
      data: result,
    });
  },
);

const getAssessmentProblems = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await AssessmentProblemServices.getAssessmentProblems(
      Number(req.params.id),
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Assessment problems retrieved successfully",
      data: result,
    });
  },
);

export const AssessmentProblemControllers = {
  addProblemToAssessment,
  getAssessmentProblems,
};
