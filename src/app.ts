import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import sendResponse from "./utils/sendResponse.js";
import globalErrorHandler from "./middleware/globalErrorHandler.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

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

// Global error handler must be registered after all routes
app.use(globalErrorHandler);

export default app;
