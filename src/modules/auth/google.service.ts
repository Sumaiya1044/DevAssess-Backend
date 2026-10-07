import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import AppError from "../../utils/AppError.js";
import { AuthServices } from "./auth.service.js";

const getGoogleConfig = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  const stateSecret = process.env.JWT_ACCESS_SECRET;

  if (!clientId || !clientSecret || !redirectUri || !stateSecret) {
    throw new Error("Google OAuth environment variables are not configured");
  }

  return {
    clientId,
    clientSecret,
    redirectUri,
    stateSecret,
  };
};

const createGoogleClient = () => {
  const {
    clientId,
    clientSecret,
    redirectUri,
  } = getGoogleConfig();

  return new OAuth2Client(
    clientId,
    clientSecret,
    redirectUri,
  );
};

const createStateToken = () => {
  const { stateSecret } = getGoogleConfig();

  return jwt.sign(
    {
      purpose: "google-oauth",
      nonce: crypto.randomBytes(16).toString("hex"),
    },
    stateSecret,
    {
      expiresIn: "10m",
    },
  );
};

const verifyStateToken = (state: string) => {
  const { stateSecret } = getGoogleConfig();

  try {
    const payload = jwt.verify(state, stateSecret) as {
      purpose?: string;
    };

    if (payload.purpose !== "google-oauth") {
      throw new Error("Invalid state");
    }
  } catch {
    throw new AppError(
      400,
      "Invalid or expired Google OAuth state",
    );
  }
};

const getAuthorizationUrl = () => {
  const client = createGoogleClient();
  const state = createStateToken();

  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "select_account",
    scope: [
      "openid",
      "email",
      "profile",
    ],
    state,
  });
};

const handleCallback = async (
  code: string,
  state: string,
) => {
  if (!code || !state) {
    throw new AppError(
      400,
      "Google authorization code and state are required",
    );
  }

  verifyStateToken(state);

  const client = createGoogleClient();

  let tokens;

  try {
    const response = await client.getToken(code);
    tokens = response.tokens;
  } catch (error) {
    console.error(
      "Google token exchange error:",
      error instanceof Error ? error.message : error,
    );

    throw new AppError(
      401,
      "Failed to exchange Google authorization code",
    );
  }

  if (!tokens.id_token) {
    throw new AppError(
      401,
      "Google ID token was not returned",
    );
  }

  return AuthServices.googleLogin(tokens.id_token);
};

export const GoogleAuthServices = {
  getAuthorizationUrl,
  handleCallback,
};
