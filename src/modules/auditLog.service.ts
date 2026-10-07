import { db } from "../prisma/db.js";

export const createAuditLog = async (data: {
  actorId?: number;
  action: string;
  entityType: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
}) => {
  return db.orm.public.AuditLog.create({
    actorId: data.actorId,
    action: data.action,
    entityType: data.entityType,
    entityId: data.entityId,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
  });
};
