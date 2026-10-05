import { Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import sendResponse from "../../utils/sendResponse.js";
import { ResultServices } from "./result.service.js";

const getMyResult = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await ResultServices.getMyResult(
      Number(req.params.id),
      req.user!.id,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Result retrieved successfully",
      data: result,
    });
  },
);

const getMyResultByAttempt = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await ResultServices.getMyResultByAttempt(
      Number(req.params.attemptId),
      req.user!.id,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Result retrieved successfully",
      data: result,
    });
  },
);

export const ResultControllers = {
  getMyResult,
  getMyResultByAttempt,
};
