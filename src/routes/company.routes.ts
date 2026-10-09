import { Router } from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import validateRequest from "../middleware/validateRequest.js";
import { CompanyControllers } from "../modules/company/company.controller.js";
import { CompanyValidations } from "../modules/company/company.validation.js";

const router = Router();

router.get(
  "/:id",
  auth,
  authorize("COMPANY", "ADMIN"),
  validateRequest(CompanyValidations.companyIdSchema),
  CompanyControllers.getCompanyById,
);

router.post(
  "/",
  auth,
  authorize("COMPANY"),
  validateRequest(CompanyValidations.createCompanySchema),
  CompanyControllers.createCompany,
);

router.patch(
  "/:id",
  auth,
  authorize("COMPANY", "ADMIN"),
  validateRequest(CompanyValidations.companyIdSchema),
  validateRequest(CompanyValidations.updateCompanySchema),
  CompanyControllers.updateCompany,
);

router.delete(
  "/:id",
  auth,
  authorize("COMPANY", "ADMIN"),
  validateRequest(CompanyValidations.companyIdSchema),
  CompanyControllers.deleteCompany,
);

export default router;
