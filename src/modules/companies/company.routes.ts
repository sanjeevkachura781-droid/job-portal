import { Router } from "express";
import { authenticate } from "../../middlewares/authenticate";
import { authorize } from "../../middlewares/authorize";
import { asyncHandler } from "../../utils/async-handler";
import { AppError } from "../../utils/app-error";
import { UserRole } from "../auth/auth.model";
import { Company } from "./company.model";

export const companyRouter = Router();
companyRouter.get("/", asyncHandler(async (_req, res) => res.json({ success: true, companies: await Company.findAll({ where: { isApproved: true } }) })));
companyRouter.get("/:id", asyncHandler(async (req, res, next) => { const company = await Company.findByPk(String(req.params.id)); if (!company) return next(new AppError("Company not found", 404)); return res.json({ success: true, company }); }));
companyRouter.post("/", authenticate, authorize(UserRole.RECRUITER), asyncHandler(async (req, res) => res.status(201).json({ success: true, company: await Company.create({ ...req.body, recruiterId: req.user!.id }) })));
companyRouter.patch("/:id", authenticate, authorize(UserRole.RECRUITER), asyncHandler(async (req, res, next) => { const company = await Company.findOne({ where: { id: req.params.id, recruiterId: req.user!.id } }); if (!company) return next(new AppError("Company not found", 404)); await company.update({ ...req.body, recruiterId: req.user!.id }); return res.json({ success: true, company }); }));
companyRouter.delete("/:id", authenticate, authorize(UserRole.RECRUITER), asyncHandler(async (req, res, next) => { const company = await Company.findOne({ where: { id: req.params.id, recruiterId: req.user!.id } }); if (!company) return next(new AppError("Company not found", 404)); await company.destroy(); return res.status(204).send(); }));
