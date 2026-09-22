import bcrypt from "bcrypt";
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

export const AuthServices = {
  registerUser,
  loginUser,
};
