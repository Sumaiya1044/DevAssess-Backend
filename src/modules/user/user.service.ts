import { db } from "../../prisma/db.js";
import AppError from "../../utils/AppError.js";

const getMyProfile = async (userId: number) => {
  const user = await db.orm.public.User
    .where({ id: userId })
    .first();

  if (!user || user.deletedAt) {
    throw new AppError(404, "User not found");
  }

  const { passwordHash: _password, ...safeUser } = user;

  return safeUser;
};

const updateMyProfile = async (
  userId: number,
  payload: { name?: string; phone?: string },
) => {
  const user = await db.orm.public.User
    .where({ id: userId })
    .first();

  if (!user || user.deletedAt) {
    throw new AppError(404, "User not found");
  }

  await db.orm.public.User
    .where({ id: userId })
    .update(payload);

  const updatedUser = await db.orm.public.User
    .where({ id: userId })
    .first();

  if (!updatedUser) {
    throw new AppError(404, "User not found");
  }

  const { passwordHash: _password, ...safeUser } = updatedUser;

  return safeUser;
};

export const UserServices = {
  getMyProfile,
  updateMyProfile,
};
