import { Request, Response } from "express";
import { AuthServices } from "./auth.service.js";
import sendResponse from "../../utils/sendResponse.js";
import { AuthenticatedRequest } from "../../middleware/auth.js";

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

const googleLogin = async (req: Request, res: Response) => {
  const result = await AuthServices.googleLogin(req.body.idToken);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Google login successful",
    data: result,
  });
};

const getMe = async (req: AuthenticatedRequest, res: Response) => {
  const result = await AuthServices.getMe(req.user!.id);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "User profile retrieved successfully",
    data: result,
  });
};

export const AuthControllers = {
  register,
  login,
  googleLogin,
  getMe,
};
