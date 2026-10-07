import { Router } from "express";
import {
  initiatePayment,
  executePayment,
} from "./payment.controller.js";

const router = Router();

router.post("/initiate", initiatePayment);
router.post("/execute", executePayment);

export default router;
