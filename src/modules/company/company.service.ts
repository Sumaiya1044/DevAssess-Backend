import { db } from "../../prisma/db.js";
import AppError from "../../utils/AppError.js";

interface CreateCompanyPayload {
  name: string;
  description?: string;
  industry?: string;
  logo?: string;
  website?: string;
}

interface UpdateCompanyPayload {
  name?: string;
  description?: string;
  industry?: string;
  logo?: string;
  website?: string;
}

const createCompany = async (
  payload: CreateCompanyPayload,
  ownerId: number,
) => {
  const owner = await db.orm.public.User
    .where({ id: ownerId })
    .first();

  if (!owner || owner.deletedAt) {
    throw new AppError(404, "Company owner not found");
  }

  if (owner.role !== "COMPANY") {
    throw new AppError(403, "Only COMPANY users can create a company");
  }

  const existingCompany = await db.orm.public.Company
    .where({ ownerId })
    .first();

  if (existingCompany && !existingCompany.deletedAt) {
    throw new AppError(400, "Company already exists for this user");
  }

  if (existingCompany?.deletedAt) {
    const restoredCompany = await db.orm.public.Company
      .where({ id: existingCompany.id })
      .update({
        name: payload.name,
        description: payload.description ?? null,
        industry: payload.industry ?? null,
        logo: payload.logo ?? null,
        website: payload.website ?? null,
        deletedAt: null,
      });

    if (!restoredCompany) {
      throw new AppError(500, "Failed to restore company");
    }

    const company = await db.orm.public.Company
      .where({ id: restoredCompany.id })
      .first();

    return company;
  }

  const company = await db.orm.public.Company.create({
    ownerId,
    name: payload.name,
    description: payload.description ?? null,
    industry: payload.industry ?? null,
    logo: payload.logo ?? null,
    website: payload.website ?? null,
  });

  return company;
};

const getCompanyById = async (companyId: number) => {
  const company = await db.orm.public.Company
    .where({ id: companyId })
    .first();

  if (!company || company.deletedAt) {
    throw new AppError(404, "Company not found");
  }

  return company;
};

const updateCompany = async (
  companyId: number,
  payload: UpdateCompanyPayload,
  userId: number,
  userRole: "ADMIN" | "COMPANY" | "CANDIDATE",
) => {
  const company = await db.orm.public.Company
    .where({ id: companyId })
    .first();

  if (!company || company.deletedAt) {
    throw new AppError(404, "Company not found");
  }

  if (userRole === "COMPANY" && company.ownerId !== userId) {
    throw new AppError(
      403,
      "You can only update your own company",
    );
  }

  if (userRole === "CANDIDATE") {
    throw new AppError(
      403,
      "Only COMPANY or ADMIN users can update a company",
    );
  }

  const updatedCompany = await db.orm.public.Company
    .where({ id: companyId })
    .update(payload);

  if (!updatedCompany) {
    throw new AppError(500, "Failed to update company");
  }

  const result = await db.orm.public.Company
    .where({ id: companyId })
    .first();

  if (!result) {
    throw new AppError(404, "Company not found");
  }

  return result;
};

export const CompanyServices = {
  createCompany,
  getCompanyById,
  updateCompany,
};
