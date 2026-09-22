import { Request, Response } from "express";
import { AuthServices } from "./auth.service.js";
import sendResponse from "../../utils/sendResponse.js";

const register = async (req: Request, res: Response) => {
  const result = await AuthServices.registerUser(req.body);

  return sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "User registered successfully",
    data: result,
  });
};

const login = async (req: Request, res: Response) => {
  const result = await AuthServices.loginUser(req.body);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Login successful",
    data: result,
  });
};

export const AuthControllers = {
  register,
  login,
};
