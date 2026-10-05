import { Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import sendResponse from "../../utils/sendResponse.js";
import { AttemptServices } from "./attempt.service.js";

const startAttempt = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await AttemptServices.startAttempt(
      req.body,
      req.user!.id,
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Assessment attempt started successfully",
      data: result,
    });
  },
);

const getMyAttempt = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await AttemptServices.getMyAttempt(
      Number(req.params.id),
      req.user!.id,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Attempt retrieved successfully",
      data: result,
    });
  },
);

const submitAttempt = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await AttemptServices.submitAttempt(
      Number(req.params.id),
      req.user!.id,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Assessment submitted successfully",
      data: result,
    });
  },
);

export const AttemptControllers = {
  startAttempt,
  getMyAttempt,
  submitAttempt,
};
