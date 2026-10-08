import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import sendResponse from "../../utils/sendResponse.js";
import catchAsync from "../../utils/catchAsync.js";
import { createAuditLog } from "../auditLog.service.js";
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

const getAllUsersForAdmin = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await UserServices.getAllUsersForAdmin();

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  },
);

const updateUserRoleForAdmin = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await UserServices.updateUserRoleForAdmin(
      Number(req.params.id),
      req.body.role,
    );

    await createAuditLog({
      actorId: req.user!.id,
      action: "UPDATE_USER_ROLE",
      entityType: "User",
      entityId: String(req.params.id),
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });

    return sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "User role updated successfully",
      data: result,
    });
  },
);

export const UserControllers = {
  getMyProfile,
  updateMyProfile,
  getAllUsersForAdmin,
  updateUserRoleForAdmin,
};
