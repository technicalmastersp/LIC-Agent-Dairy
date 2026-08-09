import apiClient from "../api/apiClient";

export const getReferralDashboard = async () => {
  const res = await apiClient.get("/referral/dashboard");
  return res.data.data;
};

export const withdrawEarnings = async () => {
  const res = await apiClient.post("/referral/withdraw");
  return res.data;
};

export const getPaymentDetails = async () => {
  const res = await apiClient.get("/user/payment-details");
  return res.data.data;
};

export const updatePaymentDetails = async (data) => {
  const res = await apiClient.put("/user/payment-details", data);
  return res.data;
};

export const lookupIfsc = async (ifscCode) => {
  const res = await apiClient.get(`/user/payment-details/ifsc/${ifscCode}`);
  return res.data.data; // { bank, branch, city, ifsc }
};