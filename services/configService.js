import apiClient from "../api/apiClient";

let cachedConfig = null;

export const getReferralConfig = async () => {
  if (cachedConfig) return cachedConfig;
  const res = await apiClient.get("/referral/config/referral");
  const data = res?.data?.data;
  // A 200 response that isn't the expected { data: {...} } (cold-starting
  // server, host fallback page, proxy error page) must be treated as a
  // failure — callers all .catch() and fall back to safe defaults. Handing
  // back `undefined` used to crash pages that read config fields on render.
  if (!data || typeof data !== "object") {
    throw new Error("Invalid referral config response");
  }
  cachedConfig = data;
  return cachedConfig;
};