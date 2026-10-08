import { Request, Response } from "express";
import sendResponse from "../utils/sendResponse.js";
import { getAllAuditLogs } from "./auditLog.service.js";

export const getAllAuditLogsController = async (
  _req: Request,
  res: Response,
) => {
  const result = await getAllAuditLogs();

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Audit logs retrieved successfully",
    data: result,
  });
};
