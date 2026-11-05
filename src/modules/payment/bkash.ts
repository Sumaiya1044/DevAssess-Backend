import axios from "axios";

const BKASH_BASE_URL =
  process.env.BKASH_BASE_URL ||
  "https://tokenized.sandbox.bka.sh/v1.2.0-beta";

interface BkashTokenResponse {
  id_token: string;
  refresh_token: string;
  expires_in: number;
  token_type?: string;
  statusCode?: string;
  statusMessage?: string;
}

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
    throw new Error("bKash credentials are not configured");
  }

  return {
    appKey: BKASH_APP_KEY,
    appSecret: BKASH_APP_SECRET,
    username: BKASH_USERNAME,
    password: BKASH_PASSWORD,
  };
};

const getAuthHeaders = () => {
  const config = getConfig();

  return {
    username: config.username,
    password: config.password,
    "Content-Type": "application/json",
  };
};

// Grant Token
export const getBkashToken = async (): Promise<BkashTokenResponse> => {
  const config = getConfig();

  const response = await axios.post<BkashTokenResponse>(
    `${BKASH_BASE_URL}/tokenized/checkout/token/grant`,
    {
      app_key: config.appKey,
      app_secret: config.appSecret,
    },
    {
      headers: getAuthHeaders(),
    },
  );

  if (!response.data.id_token || !response.data.refresh_token) {
    throw new Error("Invalid bKash grant token response");
  }

  return response.data;
};

// Refresh Token
export const refreshBkashToken = async (
  refreshToken: string,
): Promise<BkashTokenResponse> => {
  const config = getConfig();

  if (!refreshToken.trim()) {
    throw new Error("Refresh token is required");
  }

  const response = await axios.post<BkashTokenResponse>(
    `${BKASH_BASE_URL}/tokenized/checkout/token/refresh`,
    {
      app_key: config.appKey,
      app_secret: config.appSecret,
      refresh_token: refreshToken,
    },
    {
      headers: getAuthHeaders(),
    },
  );

  if (!response.data.id_token || !response.data.refresh_token) {
    throw new Error("Invalid bKash refresh token response");
  }

  return response.data;
};

// Checkout Create
export const createBkashCheckout = async (
  idToken: string,
  payload: {
    payerReference: string;
    callbackURL: string;
    amount: string;
    merchantInvoiceNumber: string;
  },
) => {
  const config = getConfig();

  const response = await axios.post(
    `${BKASH_BASE_URL}/tokenized/checkout/create`,
    {
      mode: "0011",
      payerReference: payload.payerReference,
      callbackURL: payload.callbackURL,
      amount: payload.amount,
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: payload.merchantInvoiceNumber,
    },
    {
      headers: {
        "X-App-Key": config.appKey,
        Authorization: idToken,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

// Execute Payment
export const executeBkashCheckout = async (
  idToken: string,
  paymentID: string,
) => {
  const config = getConfig();

  const response = await axios.post(
    `${BKASH_BASE_URL}/tokenized/checkout/execute`,
    { paymentID },
    {
      headers: {
        "X-App-Key": config.appKey,
        Authorization: idToken,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

// Query Payment Status
export const queryBkashPayment = async (
  idToken: string,
  paymentID: string,
) => {
  const config = getConfig();

  const response = await axios.post(
    `${BKASH_BASE_URL}/tokenized/checkout/payment/status`,
    { paymentID },
    {
      headers: {
        "X-App-Key": config.appKey,
        Authorization: idToken,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

// Query Payment Status
