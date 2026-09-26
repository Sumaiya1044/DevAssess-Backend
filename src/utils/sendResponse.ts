import { Response } from "express";

interface SendResponseOptions<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  errors?: unknown[];
  includeData?: boolean;
}

const sendResponse = <T>(
  res: Response,
  options: SendResponseOptions<T>,
): Response => {
  const response = {
    success: options.success,
    message: options.message,
    ...(options.success
      ? options.includeData === false
        ? {}
        : { data: options.data ?? {} }
      : { errors: options.errors ?? [] }),
  };

  return res.status(options.statusCode).json(response);
};

export default sendResponse;
