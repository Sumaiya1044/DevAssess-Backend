import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import { db } from "../../prisma/db.js";
import createAccessToken from "../../utils/jwt.js";

const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) => {
  const existingUser = await db.orm.public.User.first({
    email: payload.email,
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  const user = await db.orm.public.User.create({
    name: payload.name,
    email: payload.email,
    password: hashedPassword,
    phone: payload.phone,
  });

  const { password: _password, ...safeUser } = user;

  return safeUser;
};

const loginUser = async (payload: {
  email: string;
  password: string;
}) => {
  const user = await db.orm.public.User.first({
    email: payload.email,
  });

  if (!user || !user.password) {
    throw new Error("Invalid email or password");
  }

  const isPasswordMatched = await bcrypt.compare(
    payload.password,
    user.password,
  );

  if (!isPasswordMatched) {
    throw new Error("Invalid email or password");
  }

  const accessToken = createAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const { password: _password, ...safeUser } = user;

  return {
    user: safeUser,
    accessToken,
  };
};

const getMe = async (userId: number) => {
  const user = await db.orm.public.User.first({
    id: userId,
  });

  if (!user) {
    throw new Error("User not found");
  }

  const { password: _password, ...safeUser } = user;

  return safeUser;
};

const googleLogin = async (idToken: string) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;

  if (!clientId) {
    throw new Error("GOOGLE_CLIENT_ID is not configured");
  }

  const googleClient = new OAuth2Client();

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: clientId,
  });

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw new Error("Invalid Google account information");
  }

  const googleId = payload.sub;
  const email = payload.email;
  const name = payload.name || email.split("@")[0];

  let user = await db.orm.public.User.first({
    googleId,
  });

  if (!user) {
    user = await db.orm.public.User.first({
      email,
    });
  }

  if (!user) {
    user = await db.orm.public.User.create({
      name,
      email,
      googleId,
      password: null,
    });
  }

  const accessToken = createAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  const { password: _password, ...safeUser } = user;

  return {
    user: safeUser,
    accessToken,
  };
};

export const AuthServices = {
  registerUser,
  loginUser,
  getMe,
  googleLogin,
};
