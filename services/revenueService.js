import apiClient from "../api/apiClient";

export const getRevenueSummary = async (scope, year, month) => {
  const params = new URLSearchParams({ scope });
  if (year) params.set("year", year);
  if (month) params.set("month", month);
  const res = await apiClient.get(`/admin/revenue/summary?${params.toString()}`);
  return res.data.data;
};

export const getRevenueTrend = async (year) => {
  const res = await apiClient.get(`/admin/revenue/trend?year=${year}`);
  return res.data.data;
};

export const getRevenueTransactions = async (scope, year, month, type, page = 1) => {
  const params = new URLSearchParams({ scope, type, page: String(page) });
  if (year) params.set("year", year);
  if (month) params.set("month", month);
  const res = await apiClient.get(`/admin/revenue/transactions?${params.toString()}`);
  return res.data.data;
};

export const createExpense = async (data) => {
  const res = await apiClient.post("/admin/expenses", data);
  return res.data;
};

export const getExpenses = async (year, month) => {
  const params = new URLSearchParams();
  if (year) params.set("year", year);
  if (month) params.set("month", month);
  const res = await apiClient.get(`/admin/expenses?${params.toString()}`);
  return res.data.data;
};

export const deleteExpense = async (id) => {
  const res = await apiClient.delete(`/admin/expenses/${id}`);
  return res.data;
};

export const refundPayment = async (paymentId, amount, reason) => {
  const res = await apiClient.post(`/admin/payments/${paymentId}/refund`, { amount, reason });
  return res.data;
};