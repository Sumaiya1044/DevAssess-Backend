import { Response } from "express";
import catchAsync from "../../utils/catchAsync.js";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import sendResponse from "../../utils/sendResponse.js";
import { InvitationServices } from "./invitation.service.js";

const createInvitation = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await InvitationServices.createInvitation(
      req.body,
      req.user!.id,
      req.user!.role as "ADMIN" | "COMPANY",
    );

    sendResponse(res, {
      statusCode: 201,
      success: true,
      message: "Invitation created successfully",
      data: result,
    });
  },
);

const getMyInvitations = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await InvitationServices.getMyInvitations(
      req.user!.id,
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Invitations retrieved successfully",
      data: result,
    });
  },
);

const respondToInvitation = catchAsync(
  async (req: AuthenticatedRequest, res: Response) => {
    const result = await InvitationServices.respondToInvitation(
      Number(req.params.id),
      req.user!.id,
      req.body.status as "ACCEPTED" | "DECLINED",
    );

    sendResponse(res, {
      statusCode: 200,
      success: true,
      message: "Invitation response updated successfully",
      data: result,
    });
  },
);

export const InvitationControllers = {
  createInvitation,
  getMyInvitations,
  respondToInvitation,
};
