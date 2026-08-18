import apiClient from "../api/apiClient";

// Users
export const getUsers = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  const res = await apiClient.get(`/admin/users?${q}`);
  return res.data.data;
};

export const getUserDetails = async (userId) => {
  const res = await apiClient.get(`/admin/users/${userId}`);
  return res.data.data;
};

export const deleteUser = async (userId, reason) => {
  const res = await apiClient.delete(`/admin/users/${userId}`, { data: { reason } });
  return res.data;
};

export const deactivateUser = async (userId, note) => {
  const res = await apiClient.patch(`/admin/users/${userId}/deactivate`, { note });
  return res.data;
};

export const reactivateUser = async (userId) => {
  const res = await apiClient.patch(`/admin/users/${userId}/reactivate`);
  return res.data;
};

export const changeUserSubscription = async (userId, planId, reason) => {
  const res = await apiClient.patch(`/admin/users/${userId}/subscription`, { planId, reason });
  return res.data;
};

// Admins
export const getAdmins = async () => {
  const res = await apiClient.get("/admin/admins");
  return res.data.data;
};

export const createAdmin = async (data) => {
  const res = await apiClient.post("/admin/create-admin", data);
  return res.data;
};

// Dashboard
export const getDashboardStats = async () => {
  const res = await apiClient.get("/admin/dashboard");
  return res.data.data;
};

// Permissions
export const updateAdminPermissions = async ( adminId, permissions ) => {
  const res = await apiClient.patch(`/admin/admins/${adminId}/permissions`, { permissions });
  return res.data;
};

// Withdrawals
export const getWithdrawals = async (status = "requested", page = 1) => {
  const res = await apiClient.get(`/admin/withdrawals?status=${status}&page=${page}`);
  return res.data.data;
};

export const approveWithdrawal = async (referralId, withdrawalId, note) => {
  const res = await apiClient.patch(`/admin/withdrawals/${referralId}/${withdrawalId}/approve`, { note });
  return res.data;
};

export const rejectWithdrawal = async (referralId, withdrawalId, reason) => {
  const res = await apiClient.patch(`/admin/withdrawals/${referralId}/${withdrawalId}/reject`, { reason });
  return res.data;
};

// Logs
export const getActivityLogs = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  const res = await apiClient.get(`/admin/logs?${q}`);
  return res.data.data;
};

// My Permissions
export const getMyPermissions = async () => {
  const res = await apiClient.get("/admin/my-permissions");
  return res.data;
};

export const getPendingCounts = async () => {
  const res = await apiClient.get("/admin/pending-counts");
  return res.data.data;
};

export const triggerNextMonthDueReminders = async () => {
  const res = await apiClient.post("/admin/trigger-next-month-due-reminders");
  return res.data;
};

export const triggerMissedPaymentReminders = async () => {
  const res = await apiClient.post("/admin/trigger-missed-payment-reminders");
  return res.data;
};

export const getSupportTickets = async (priority = "all", status) => {
  const params = new URLSearchParams({ priority });
  if (status) params.set("status", status);
  const res = await apiClient.get(`/admin/support/tickets?${params.toString()}`);
  return res.data.data;
};

export const replyToTicket = async (ticketId, payload) => {
  const res = await apiClient.patch(`/admin/support/tickets/${ticketId}`, payload);
  return res.data;
};

export const getAllSuggestions = async () => {
  const res = await apiClient.get("/admin/suggestions");
  return res.data.data;
};

export const updateSuggestionStatus = async (id, payload) => {
  const res = await apiClient.patch(`/admin/suggestions/${id}`, payload);
  return res.data;
};

// Force Logout a user or admin
export const forceLogoutUser = async (userId, reason) => {
  const res = await apiClient.post(`/admin/force-logout/${userId}`, { reason });
  return res.data;
};

// Force Logout group
export const forceLogoutGroup = async (
  target,
  reason
) => {
  const res = await apiClient.post("/admin/force-logout-group", { target, reason });
  return res.data;
};

export const getSuperAdmins = async () => {
  const res = await apiClient.get("/admin/superadmins");
  return res.data.data;
};

export const promoteAdmin = async (adminId, durationHours, reason) => {
  const res = await apiClient.post(`/admin/admins/${adminId}/promote`, { durationHours, reason });
  return res.data;
};

export const demoteAdmin = async (adminId) => {
  const res = await apiClient.post(`/admin/admins/${adminId}/demote`);
  return res.data;
};

// Payment verification
export const getPendingUpiVerifications = async () => {
  const res = await apiClient.get("/admin/payment-verifications/upi/pending");
  return res.data.data;
};

export const verifyUpiId = async (userId) => {
  const res = await apiClient.patch(`/admin/payment-verifications/upi/${userId}/approve`);
  return res.data;
};

export const rejectUpiId = async (userId, reason) => {
  const res = await apiClient.patch(`/admin/payment-verifications/upi/${userId}/reject`, { reason });
  return res.data;
};