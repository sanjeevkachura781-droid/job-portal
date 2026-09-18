import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { asyncHandler } from "../../utils/async-handler";
import { AppError } from "../../utils/app-error";
import { UserRole } from "../auth/auth.model";
import { Application, ApplicationStatus } from "./application.model";
import { Job, JobStatus } from "../jobs/job.model";
import { User } from "../auth/auth.model";

export const applicationRouter = Router();
applicationRouter.post("/jobs/:jobId/applications", authenticate, authorize(UserRole.CANDIDATE), asyncHandler(async (req, res, next) => { const job = await Job.findOne({ where: { id: req.params.jobId, status: JobStatus.PUBLISHED } }); if (!job) return next(new AppError("Published job not found", 404)); const existing = await Application.findOne({ where: { jobId: job.id, candidateId: req.user!.id } }); if (existing) return next(new AppError("You have already applied for this job", 409)); const application = await Application.create({ ...req.body, jobId: job.id, candidateId: req.user!.id }); return res.status(201).json({ success: true, application }); }));
applicationRouter.get("/applications/my", authenticate, authorize(UserRole.CANDIDATE), asyncHandler(async (req, res) => res.json({ success: true, applications: await Application.findAll({ where: { candidateId: req.user!.id }, include: [{ model: Job, as: "job" }] }) })));
applicationRouter.get("/applications/recruiter", authenticate, authorize(UserRole.RECRUITER), asyncHandler(async (req, res) => {
	const applications = await Application.findAll({
		include: [
			{ model: Job, as: "job", where: { recruiterId: req.user!.id } },
			{ model: User, as: "candidate", attributes: ["id", "name", "email"] },
		],
		order: [["appliedAt", "DESC"]],
	});
	return res.json({ success: true, applications });
}));
applicationRouter.get("/jobs/:jobId/applications", authenticate, authorize(UserRole.RECRUITER), asyncHandler(async (req, res, next) => { const job = await Job.findOne({ where: { id: req.params.jobId, recruiterId: req.user!.id } }); if (!job) return next(new AppError("Job not found", 404)); return res.json({ success: true, applications: await Application.findAll({ where: { jobId: job.id } }) }); }));
applicationRouter.get("/applications/:id", authenticate, asyncHandler(async (req, res, next) => { const where = req.user!.role === UserRole.CANDIDATE ? { id: req.params.id, candidateId: req.user!.id } : { id: req.params.id }; const application = await Application.findOne({ where }); if (!application) return next(new AppError("Application not found", 404)); return res.json({ success: true, application }); }));
applicationRouter.patch("/applications/:id/status", authenticate, authorize(UserRole.RECRUITER, UserRole.ADMIN), asyncHandler(async (req, res, next) => { const application = await Application.findByPk(String(req.params.id)); if (!application) return next(new AppError("Application not found", 404)); if (req.user!.role === UserRole.RECRUITER) { const job = await Job.findOne({ where: { id: application.jobId, recruiterId: req.user!.id } }); if (!job) return next(new AppError("Application not found", 404)); } await application.update({ status: req.body.status as ApplicationStatus }); return res.json({ success: true, application }); }));
applicationRouter.patch("/applications/:id/withdraw", authenticate, authorize(UserRole.CANDIDATE), asyncHandler(async (req, res, next) => { const application = await Application.findOne({ where: { id: req.params.id, candidateId: req.user!.id } }); if (!application) return next(new AppError("Application not found", 404)); await application.update({ status: ApplicationStatus.WITHDRAWN }); return res.json({ success: true, application }); }));
