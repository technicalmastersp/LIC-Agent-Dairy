import apiClient from "../api/apiClient";

export const createTicket = async (data) => {
  const res = await apiClient.post("/support/tickets", data);
  return res.data;
};

export const getMyTickets = async () => {
  const res = await apiClient.get("/support/tickets/mine");
  return res.data.data;
};