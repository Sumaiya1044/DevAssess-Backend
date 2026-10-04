import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/auth.js";
import sendResponse from "../../utils/sendResponse.js";
import { CompanyServices } from "./company.service.js";

const getCompanyById = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const result = await CompanyServices.getCompanyById(Number(req.params.id));

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Company retrieved successfully",
    data: result,
  });
};

const createCompany = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const result = await CompanyServices.createCompany(
    req.body,
    req.user!.id,
  );

  return sendResponse(res, {
    statusCode: 201,
    success: true,
    message: "Company created successfully",
    data: result,
  });
};

const updateCompany = async (
  req: AuthenticatedRequest,
  res: Response,
) => {
  const result = await CompanyServices.updateCompany(
    Number(req.params.id),
    req.body,
    req.user!.id,
    req.user!.role,
  );

  return sendResponse(res, {
    statusCode: 200,
    success: true,
    message: "Company updated successfully",
    data: result,
  });
};

export const CompanyControllers = {
  createCompany,
  getCompanyById,
  updateCompany,
};
