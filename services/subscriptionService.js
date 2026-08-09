import apiClient from "../api/apiClient"; // your existing axios instance

export const getSubscription = async () => {
  const res = await apiClient.get("/subscription");
  return res.data.data;
};

export const changePlan = async (planId) => {
  const res = await apiClient.post("/subscription/change", { planId });
  return res.data.data;
};

export const cancelSubscription = async () => {
  const res = await apiClient.patch("/subscription/cancel");
  return res.data.data;
};

export const createCheckoutOrder = async (planId) => {
  const res = await apiClient.post("/subscription/checkout/create", { planId });
  return res.data.data; // { razorpayOrderId, amount, currency, keyId }
};

export const verifyPayment = async (payload) => {
  // payload: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
  const res = await apiClient.post("/subscription/checkout/verify", payload);
  return res.data.data;
};