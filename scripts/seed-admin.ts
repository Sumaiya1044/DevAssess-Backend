import "dotenv/config";
import bcrypt from "bcrypt";
import { db } from "../src/prisma/db.js";

const seedAdmin = async () => {
  const email = "admin@devassess.com";
  const password = "Admin@12345";

  const existingAdmin = await db.orm.public.User
    .where({ email })
    .first();

  if (existingAdmin) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.orm.public.User.create({
    name: "DevAssess Admin",
    email,
    passwordHash,
    role: "ADMIN",
    status: "ACTIVE",
  });

  console.log("Admin created successfully");
  console.log(`Email: ${email}`);
  console.log(`Password: ${password}`);
};

seedAdmin().catch((error) => {
  console.error("Failed to create admin:", error);
  process.exit(1);
});
