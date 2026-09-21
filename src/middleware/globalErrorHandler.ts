import { NextFunction, Request, Response } from "express";
import sendResponse from "../utils/sendResponse.js";

const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err);

  sendResponse(res, {
    statusCode: 500,
    success: false,
    message: err.message || "Internal server error",
    errors: [],
  });
};

export default globalErrorHandler;
