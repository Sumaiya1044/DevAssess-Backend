
import axios from "axios";
import { randomUUID } from "node:crypto";
import { db } from "../../prisma/db.js";

const BKASH_BASE_URL =
  process.env.BKASH_BASE_URL ||
  "https://tokenized.sandbox.bka.sh/v1.2.0-beta";

const getConfig = () => {
  const {
    BKASH_APP_KEY,
    BKASH_APP_SECRET,
    BKASH_USERNAME,
    BKASH_PASSWORD,
  } = process.env;

  if (
    !BKASH_APP_KEY?.trim() ||
    !BKASH_APP_SECRET?.trim() ||
    !BKASH_USERNAME?.trim() ||
    !BKASH_PASSWORD?.trim()
  ) {
    throw new Error("bKash sandbox credentials are not configured");
  }

  return {
    appKey: BKASH_APP_KEY,
    appSecret: BKASH_APP_SECRET,
    username: BKASH_USERNAME,
    password: BKASH_PASSWORD,
  };
};

let tokenCache: {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
} | null = null;

export const getBkashToken = async () => {
  const config = getConfig();

  if (tokenCache && Date.now() < tokenCache.expiresAt) {
    return tokenCache.idToken;
  }

  const response = await axios.post(
    `${BKASH_BASE_URL}/tokenized/checkout/token/grant`,
    {
      app_key: config.appKey,
      app_secret: config.appSecret,
    },
    {
      headers: {
        username: config.username,
        password: config.password,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.data.id_token || !response.data.expires_in) {
    throw new Error("Invalid bKash token response");
  }

  tokenCache = {
    idToken: response.data.id_token,
    refreshToken: response.data.refresh_token,
    expiresAt:
      Date.now() + Math.max(1, response.data.expires_in - 60) * 1000,
  };

  return tokenCache.idToken;
};

export const createBkashPayment = async (params: {
  userId: number;
  assessmentId: number;
  payerReference: string;
}) => {
  const assessment = await db.orm.public.Assessment
    .where({ id: params.assessmentId })
    .first();

  if (!assessment || assessment.deletedAt) {
    throw new Error("Assessment not found");
  }

  if (assessment.status !== "PUBLISHED") {
    throw new Error("Only published assessments can be paid for");
  }

  const amount = Number(assessment.price);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("This assessment does not have a payable price");
  }

  const callbackURL = process.env.BKASH_CALLBACK_URL?.trim();

  if (!callbackURL) {
    throw new Error("BKASH_CALLBACK_URL is not configured");
  }

  const transactionId = randomUUID();

  const localPayment = await db.orm.public.Payment.create({
    userId: params.userId,
    assessmentId: assessment.id,
    provider: "BKASH",
    status: "PENDING",
    amount,
    currency: "BDT",
    transactionId,
    metadata: {

      payerReference: params.payerReference,
    },
  });

  try {
    const token = await getBkashToken();
    const config = getConfig();

    const response = await axios.post(
      `${BKASH_BASE_URL}/tokenized/checkout/create`,
      {
        mode: "0011",
        payerReference: params.payerReference,
        callbackURL,
        amount: amount.toFixed(2),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: transactionId,
      },
      {
        headers: {
          "X-App-Key": config.appKey,
          Authorization: token,
          "Content-Type": "application/json",
        },
      },
    );

    const gatewayPaymentId = response.data.paymentID;
    const checkoutUrl = response.data.bkashURL;

    if (!gatewayPaymentId || !checkoutUrl) {
      throw new Error(
        "bKash response is missing paymentId or bkashURL",
      );
    }

    const updatedPayment = await db.orm.public.Payment
      .where({ id: localPayment.id, userId: params.userId })
      .update({
        providerPaymentId: gatewayPaymentId,
        providerSessionId: gatewayPaymentId,
        metadata: {

          payerReference: params.payerReference,
          gatewayCreateResponse: response.data,
        },
      });

    if (!updatedPayment) {
      throw new Error("Could not save the bKash payment reference");
    }

    return {
      transactionId,
      checkoutUrl,
      payment: await db.orm.public.Payment
        .where({ id: localPayment.id, userId: params.userId })
        .first(),
      gateway: response.data,
    };
  } catch (error) {
    await db.orm.public.Payment
      .where({ id: localPayment.id, userId: params.userId })
      .update({ status: "FAILED" });

    throw error;
  }
};

export const executeBkashPayment = async (
  gatewayPaymentId: string,
  userId: number,
) => {
  const localPayment = await db.orm.public.Payment
    .where({
      providerPaymentId: gatewayPaymentId,
      userId,
      provider: "BKASH",
    })
    .first();

  if (!localPayment) {
    throw new Error("Payment not found for this user");
  }

  if (localPayment.status === "PAID") {
    return localPayment;
  }

  if (localPayment.status !== "PENDING") {
    throw new Error("Only pending payments can be executed");
  }

  const token = await getBkashToken();
  const config = getConfig();

  const response = await axios.post(
    `${BKASH_BASE_URL}/tokenized/checkout/execute`,
    { paymentID: gatewayPaymentId },
    {
      headers: {
        "X-App-Key": config.appKey,
        Authorization: token,
        "Content-Type": "application/json",
      },
    },
  );

  const result = response.data;
  console.log("BKASH EXECUTE RESPONSE:", JSON.stringify(result, null, 2));
  const gatewayAmount = Number(result.amount);
  const gatewayStatus = String(
    result.transactionStatus ?? "",
  ).toLowerCase();

  if (
    String(result.statusCode) !== "0000" ||
    gatewayStatus !== "completed" ||
    !Number.isFinite(gatewayAmount) ||
    Math.abs(gatewayAmount - Number(localPayment.amount)) > 0.001
  ) {
    throw new Error(
      "bKash payment is not confirmed or its amount does not match",
    );
  }

  const updated = await db.orm.public.Payment
    .where({ id: localPayment.id, userId })
    .update({
      status: "PAID",
      paidAt: new Date().toISOString(),
      metadata: {
        ...(typeof localPayment.metadata === "object" && localPayment.metadata !== null ? localPayment.metadata : {}),
        gatewayExecuteResponse: result,
      },
    });

  if (!updated) {
    throw new Error("Could not update the payment status");
  }

  return db.orm.public.Payment
    .where({ id: localPayment.id, userId })
    .first();
};

export const getPaymentStatus = async (
  paymentId: number,
  userId: number,
) => {
  const payment = await db.orm.public.Payment
    .where({
      id: paymentId,
      userId,
      provider: "BKASH",
    })
    .first();

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
};


// Public callback: verify payment directly with bKash.
export const handleBkashCallback = async (paymentID: string) => {
  if (!paymentID?.trim()) {
    throw new Error("Invalid bKash payment ID");
  }

  const payment = await db.orm.public.Payment
    .where({
      providerPaymentId: paymentID,
      provider: "BKASH",
    })
    .first();

  if (!payment) {
    throw new Error("Payment not found for this callback");
  }

  if (payment.status === "PAID") {
    return payment;
  }

  if (payment.status !== "PENDING") {
    throw new Error("Payment is not pending");
  }

  // Execute API independently verifies the gateway transaction.
  return executeBkashPayment(paymentID, payment.userId);
}

