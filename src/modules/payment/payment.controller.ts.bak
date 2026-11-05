import { Request, Response } from "express";
import {
  createBkashPayment,
  executeBkashPayment,
} from "./payment.service.js";

export const initiatePayment = async (req: Request, res: Response) => {
  try {
    const { amount, payerReference, invoiceNumber } = req.body;

    const payment = await createBkashPayment({
      amount,
      payerReference,
      invoiceNumber,
    });

    res.status(200).json({
      success: true,
      message: "bKash payment initiated successfully",
      data: payment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to initiate bKash payment",
      errors: [error.response?.data || error.message],
    });
  }
};

export const executePayment = async (req: Request, res: Response) => {
  try {
    const { paymentId } = req.body;

    const payment = await executeBkashPayment(paymentId);

    res.status(200).json({
      success: true,
      message: "bKash payment executed successfully",
      data: payment,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to execute bKash payment",
      errors: [error.response?.data || error.message],
    });
  }
};
