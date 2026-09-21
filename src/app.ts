import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

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
  res.status(200).json({
    success: true,
    message: "DevAssess API is running",
    data: {},
  });
});

export default app;
