import { Response } from "express";

interface SendResponseOptions<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
}

const sendResponse = <T>(
  res: Response,
  options: SendResponseOptions<T>,
): Response => {
  return res.status(options.statusCode).json({
    success: options.success,
    message: options.message,
    ...(options.success
      ? { data: options.data ?? {} }
      : { errors: options.errors ?? [] }),
  });
};

export default sendResponse;
