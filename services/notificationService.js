import apiClient from "../api/apiClient";

export const getUnreadCount = async () => {
  const res = await apiClient.get("/notifications/unread-count");
  return res.data.data.unreadCount; // number
};

export const getNotifications = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  const res = await apiClient.get(`/notifications${q ? `?${q}` : ""}`);
  return res.data.data; // { notifications, unreadCount, hasMore, nextBefore }
};

export const markNotificationRead = async (id) => {
  const res = await apiClient.patch(`/notifications/${id}/read`);
  return res.data;
};

export const markAllNotificationsRead = async () => {
  const res = await apiClient.patch("/notifications/read-all");
  return res.data;
};
