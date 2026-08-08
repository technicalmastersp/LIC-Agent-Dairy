import apiClient from "../api/apiClient";

let cachedConfig = null;

export const getReferralConfig = async () => {
  if (cachedConfig) return cachedConfig;
  const res = await apiClient.get("/referral/config/referral");
  cachedConfig = res.data.data;
  return cachedConfig;
};