import { Router } from "express";
import auth from "../middleware/auth.js";
import authorize from "../middleware/authorize.js";
import validateRequest from "../middleware/validateRequest.js";
import { InvitationControllers } from "../modules/invitation/invitation.controller.js";
import { InvitationValidations } from "../modules/invitation/invitation.validation.js";

const router = Router();

router.post(
  "/",
  auth,
  authorize("ADMIN", "COMPANY"),
  validateRequest(InvitationValidations.createInvitationSchema),
  InvitationControllers.createInvitation,
);

router.get(
  "/my-invitations",
  auth,
  authorize("CANDIDATE"),
  InvitationControllers.getMyInvitations,
);

router.patch(
  "/:id/respond",
  auth,
  authorize("CANDIDATE"),
  validateRequest(InvitationValidations.respondInvitationSchema),
  InvitationControllers.respondToInvitation,
);

export default router;
