import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import sendResponse from "./utils/sendResponse.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import issuesRoutes from "./routes/issues.routes.js";
import assessmentRoutes from "./routes/assessment.routes.js";
import companyRoutes from "./routes/company.routes.js";
import problemRoutes from "./routes/problem.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";
import attemptRoutes from "./routes/attempt.routes.js";
import submissionRoutes from "./routes/submission.routes.js";
import resultRoutes from "./routes/result.routes.js";
import userRoutes from "./routes/user.routes.js";

const app = express();

app.use(helmet({ contentSecurityPolicy: { directives: { "script-src": ["'self'", "https://accounts.google.com", "'unsafe-inline'"], "frame-src": ["https://accounts.google.com"], "connect-src": ["'self'", "https://accounts.google.com"] } } }));

app.use(cors());

app.use(express.json());
app.use(express.static("public"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: "Too many requests",
    errors: [],
  },
});

app.use(limiter);

app.get("/", (_req, res) => {
  sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "DevAssess API is running",
    data: {},
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/v1/auth", authRoutes);

app.use("/api/issues", issuesRoutes);
app.use("/api/v1/assessments", assessmentRoutes);
app.use("/api/v1/companies", companyRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/invitations", invitationRoutes);
app.use("/api/v1/attempts", attemptRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/v1/results", resultRoutes);
app.use("/api/v1/users", userRoutes);

app.use(globalErrorHandler);

export default app;