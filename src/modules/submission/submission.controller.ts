import { Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import sendResponse from "../../utils/sendResponse.js";
import { SubmissionServices } from "./submission.service.js";

const createSubmission = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await SubmissionServices.createSubmission(
      req.body,
      req.user!.id,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Answer submitted successfully",
      data: result,
    });
  },
);

const getMySubmission = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await SubmissionServices.getMySubmission(
      Number(req.params.id),
      req.user!.id,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Submission retrieved successfully",
      data: result,
    });
  },
);

export const SubmissionControllers = {
  createSubmission,
  getMySubmission,
};
