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