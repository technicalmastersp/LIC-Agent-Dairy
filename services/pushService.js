import apiClient from "../api/apiClient";

export const getPushConfig = async () => {
  const res = await apiClient.get("/notifications/push/config");
  return res.data.data; // { enabled, publicKey }
};

export const subscribePush = async (subscription) => {
  const res = await apiClient.post("/notifications/push/subscribe", { subscription });
  return res.data;
};

export const unsubscribePush = async (endpoint) => {
  const res = await apiClient.post("/notifications/push/unsubscribe", { endpoint });
  return res.data;
};

export const getPushStatus = async (endpoint) => {
  const res = await apiClient.post("/notifications/push/status", { endpoint });
  return res.data.data.subscribed; // boolean — is THIS device registered to THIS account?
};

export const sendTestPush = async () => {
  const res = await apiClient.post("/notifications/push/test");
  return res.data;
};
