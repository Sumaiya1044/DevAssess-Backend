import { Request, Response } from "express";
import {
  createBkashPayment,
  executeBkashPayment,
  getPaymentStatus,
  handleBkashCallback,
} from "./payment.service.js";
import type { AuthenticatedRequest } from "../../middleware/auth.js";

export const initiatePayment = async (
  req: Request,
  res: Response,
) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        errors: [],
      });
    }

    const { assessmentId, payerReference } = req.body;

    const payment = await createBkashPayment({
      userId: authReq.user.id,
      assessmentId,
      payerReference,
    });

    return res.status(201).json({
      success: true,
      message: "Payment session created",
      data: payment,
    });
  } catch (error: unknown) {
    const message = axiosErrorMessage(error);
    const status = message.includes("credentials are not configured")
      ? 503
      : message.includes("Assessment not found")
        ? 404
        : 400;

    return res.status(status).json({
      success: false,
      message: "Failed to initiate bKash payment",
      errors: [message],
    });
  }
};

export const executePayment = async (
  req: Request,
  res: Response,
) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        errors: [],
      });
    }

    const { paymentId } = req.body;

    const payment = await executeBkashPayment(
      paymentId,
      authReq.user.id,
    );

    return res.status(200).json({
      success: true,
      message: "Payment status verified",
      data: payment,
    });
  } catch (error: unknown) {
    return res.status(400).json({
      success: false,
      message: "Could not verify or execute bKash payment",
      errors: [axiosErrorMessage(error)],
    });
  }
};

function axiosErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected payment error occurred";
}

export const getPaymentStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const authReq = req as AuthenticatedRequest;

    if (!authReq.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
        errors: [],
      });
    }

    const paymentId = Number(req.params.id);

    if (!Number.isInteger(paymentId) || paymentId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID",
        errors: [],
      });
    }

    const payment = await getPaymentStatus(
      paymentId,
      authReq.user.id,
    );

    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found", errors: [] });
    }

    return res.status(200).json({
      success: true,
      message: "Payment status retrieved successfully",
      data: {
        id: payment.id,
        transactionId: payment.transactionId,
        provider: payment.provider,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        assessmentId: payment.assessmentId,
        paidAt: payment.paidAt,
        createdAt: payment.createdAt,
      },
    });
  } catch (error: unknown) {
    const message = axiosErrorMessage(error);
    const status = message === "Payment not found" ? 404 : 400;

    return res.status(status).json({
      success: false,
      message: "Could not retrieve payment status",
      errors: [message],
    });
  }
};


export const bkashCallback = async (
  req: Request,
  res: Response,
) => {
  try {
    const paymentID = req.query.paymentID;
    const status = req.query.status;

    if (
      typeof paymentID !== "string" ||
      typeof status !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid bKash callback parameters",
        errors: [],
      });
    }

    const callbackStatus = status.toLowerCase();

    if (callbackStatus === "failure" || callbackStatus === "cancel") {
      // Do not trust an unsigned callback to change payment status.
      return res.status(200).json({
        success: true,
        message: "Payment was not completed",
      });
    }

    if (callbackStatus !== "success") {
      return res.status(400).json({
        success: false,
        message: "Unknown bKash callback status",
        errors: [],
      });
    }

    const payment = await handleBkashCallback(paymentID);

    return res.status(200).json({
      success: payment?.status === "PAID",
      message: payment?.status === "PAID"
        ? "bKash payment verified successfully"
        : "Payment verification is pending",
      data: payment,
    });
  } catch (error: unknown) {
    return res.status(400).json({
      success: false,
      message: "bKash callback verification failed",
      errors: [axiosErrorMessage(error)],
    });
  }
};
