import bcrypt from "bcrypt";
import { db } from "../../prisma/db.js";

const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
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
  });

  return user;
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

  return user;
};

export const AuthServices = {
  registerUser,
  loginUser,
};
