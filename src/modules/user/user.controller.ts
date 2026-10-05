import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import sendResponse from "../../utils/sendResponse.js";
import catchAsync from "../../utils/catchAsync.js";
import { UserServices } from "./user.service.js";

const getMyProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await UserServices.getMyProfile(req.user!.id);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile retrieved successfully",
    data: result,
  });
});

const updateMyProfile = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const result = await UserServices.updateMyProfile(
    req.user!.id,
    req.body,
  );

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const UserControllers = {
  getMyProfile,
  updateMyProfile,
};
