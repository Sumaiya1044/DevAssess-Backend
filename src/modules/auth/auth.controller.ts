import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse.js";
import { AuthServices } from "./auth.service.js";

const signup = async (req: Request, res: Response) => {
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

const logout = async (req: Request, res: Response) => {
  await AuthServices.logoutUser(req.body.refreshToken);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Logout successful",
    data: {},
  });
};

const refreshToken = async (req: Request, res: Response) => {
  const result = await AuthServices.refreshAccessToken(req.body.refreshToken);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Access token refreshed successfully",
    data: result,
  });
};

export const AuthControllers = {
  signup,
  login,
  refreshToken,
  logout,
};
