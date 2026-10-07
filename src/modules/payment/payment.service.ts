import axios from "axios";

const BKASH_BASE_URL =
  process.env.BKASH_BASE_URL ||
  "https://tokenized.sandbox.bka.sh/v2/tokenized-checkout";

const getConfig = () => ({
  appKey: process.env.BKASH_APP_KEY!,
  appSecret: process.env.BKASH_APP_SECRET!,
  username: process.env.BKASH_USERNAME!,
  password: process.env.BKASH_PASSWORD!,
});

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
    `${BKASH_BASE_URL}/auth/grant-token`,
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

  tokenCache = {
    idToken: response.data.id_token,
    refreshToken: response.data.refresh_token,
    expiresAt: Date.now() + (response.data.expires_in - 60) * 1000,
  };

  return tokenCache.idToken;
};

export const createBkashPayment = async (params: {
  amount: number;
  payerReference: string;
  invoiceNumber: string;
}) => {
  const token = await getBkashToken();
  const config = getConfig();

  const response = await axios.post(
    `${BKASH_BASE_URL}/payment/create`,
    {
      payerReference: params.payerReference,
      callbackURL: process.env.BKASH_CALLBACK_URL,
      amount: params.amount.toFixed(2),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: params.invoiceNumber,
    },
    {
      headers: {
        "X-App-Key": config.appKey,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};

export const executeBkashPayment = async (paymentId: string) => {
  const token = await getBkashToken();
  const config = getConfig();

  const response = await axios.post(
    `${BKASH_BASE_URL}/payment/execute`,
    {
      paymentId,
    },
    {
      headers: {
        "X-App-Key": config.appKey,
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    },
  );

  return response.data;
};
