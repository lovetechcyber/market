import axios from "axios";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

export const paystack = axios.create({
  baseURL: "https://api.paystack.co",
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET}`,
    "Content-Type": "application/json",
  },
});

// Initialize Escrow Payment
export const initiateEscrowPayment = async (email, amount, reference, metadata) => {
  const response = await paystack.post("/transaction/initialize", {
    email,
    amount: amount * 100, // convert to kobo
    reference,
    metadata,
    callback_url: `${process.env.CLIENT_URL}/payment-status`,
  });
  return response.data;
};

// Verify Payment
export const verifyPayment = async (reference) => {
  const response = await paystack.get(`/transaction/verify/${reference}`);
  return response.data;
};



// New: create transfer recipient (bank)
export const createTransferRecipient = async ({ type = "nuban", name, account_number, bank_code }) => {
  const res = await paystack.post("/transferrecipient", {
    type, name, account_number, bank_code,
  });
  return res.data;
};

// New: initiate transfer
export const initiateTransfer = async ({ source = "balance", reason, amount, recipient }) => {
  const res = await paystack.post("/transfer", {
    source,
    reason,
    amount: Math.round(amount * 100),
    recipient,
  });
  return res.data;
};

// New: verify transfer
export const verifyTransfer = async (transferId) => {
  const res = await paystack.get(`/transfer/${transferId}`);
  return res.data;
};

// New: refund (re-use verify endpoint for charge refunds alternative)
export const refundCharge = async (transactionId) => {
  const res = await paystack.post(`/refund`, { transaction: transactionId });
  return res.data;
};
