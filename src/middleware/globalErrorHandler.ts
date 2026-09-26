import { NextFunction, Request, Response } from "express";
import sendResponse from "../utils/sendResponse.js";
import AppError from "../utils/AppError.js";

const globalErrorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err);

  if (err instanceof AppError) {
    return sendResponse(res, {
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      errors: [],
    });
  }

  return sendResponse(res, {
    statusCode: 500,
    success: false,
    message: "Internal server error",
    errors: [],
  });
};

export default globalErrorHandler;
