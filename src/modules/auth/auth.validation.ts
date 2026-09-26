import { z } from "zod";

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters"),
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .toLowerCase(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    phone: z
      .string()
      .trim()
      .min(10, "Phone number must be at least 10 characters")
      .optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .trim()
      .email("Invalid email address")
      .toLowerCase(),
    password: z.string().min(1, "Password is required"),
  }),
});

export const googleLoginSchema = z.object({
  body: z.object({
    idToken: z
      .string()
      .min(1, "Google ID token is required"),
  }),
});
