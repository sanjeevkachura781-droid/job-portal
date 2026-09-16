import cors from "cors";
import express from "express";
import helmet from "helmet";
import { authRouter } from "./modules/auth/auth.routes";
import { errorHandler } from "./middlewares/error-handler";
import { notFound } from "./middlewares/not-found";
import path from "node:path";
import { companyRouter } from "./modules/companies/company.routes";
import { jobRouter } from "./modules/jobs/job.routes";
import { applicationRouter } from "./modules/applications/application.routes";
import { interviewRouter } from "./modules/interviews/interview.routes";
import { notificationRouter } from "./modules/notifications/notification.routes";
import { userRouter } from "./modules/users/user.routes";
import { adminRouter } from "./modules/admin/admin.routes";
import "./config/associations";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.resolve("uploads")));

app.get("/", (_req, res) => {
  res.json({
    message: "Welcome to the Job Portal API",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Job Portal API is running",
  });
});

app.use("/api/auth", authRouter);
app.use("/api/companies", companyRouter);
app.use("/api/jobs", jobRouter);
app.use("/api", applicationRouter);
app.use("/api", interviewRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);
app.use(notFound);
app.use(errorHandler);
