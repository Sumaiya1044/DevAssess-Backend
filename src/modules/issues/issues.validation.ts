import { z } from "zod";

export const createIssueSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(1, "Title is required")
      .max(150, "Title must be at most 150 characters"),
    description: z
      .string()
      .trim()
      .min(20, "Description must be at least 20 characters"),
    type: z.enum(["bug", "feature_request"]),
  }),
});

export const getIssuesSchema = z.object({
  query: z.object({
    sort: z.enum(["newest", "oldest"]).optional(),
    type: z.enum(["bug", "feature_request"]).optional(),
    status: z.enum(["open", "in_progress", "resolved"]).optional(),
  }),
});

export const issueIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Issue id must be a number"),
  }),
});

export const updateIssueSchema = z.object({
  params: z.object({
    id: z.string().regex(/^\d+$/, "Issue id must be a number"),
  }),
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, "Title cannot be empty")
        .max(150, "Title must be at most 150 characters")
        .optional(),
      description: z
        .string()
        .trim()
        .min(20, "Description must be at least 20 characters")
        .optional(),
      type: z.enum(["bug", "feature_request"]).optional(),
      status: z.enum(["open", "in_progress", "resolved"]).optional(),
    })
    .refine(
      (value) =>
        value.title !== undefined ||
        value.description !== undefined ||
        value.type !== undefined ||
        value.status !== undefined,
      {
        message: "At least one field is required",
      },
    ),
});
