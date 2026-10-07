import { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse.js";
import { GoogleAuthServices } from "./google.service.js";

const startGoogleLogin = (_req: Request, res: Response) => {
  const url = GoogleAuthServices.getAuthorizationUrl();

  return res.redirect(url);
};

const googleCallback = async (req: Request, res: Response) => {
  const code = String(req.query.code ?? "");
  const state = String(req.query.state ?? "");

  const result = await GoogleAuthServices.handleCallback(code, state);

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Google login successful",
    data: result,
  });
};

export const GoogleAuthControllers = {
  startGoogleLogin,
  googleCallback,
};
