import { Router } from "express";
import auth from "../../middleware/auth.js";
import validateRequest from "../../middleware/validateRequest.js";
import {
  initiatePayment,
  executePayment,
} from "./payment.controller.js";
import {
  initiatePaymentSchema,
  executePaymentSchema,
} from "./payment.validation.js";

const router = Router();

router.post(
  "/initiate",
  auth,
  validateRequest(initiatePaymentSchema),
  initiatePayment,
);

router.post(
  "/execute",
  auth,
  validateRequest(executePaymentSchema),
  executePayment,
);

export default router;
