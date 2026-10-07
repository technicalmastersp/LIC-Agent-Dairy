import apiClient from "../api/apiClient";

// POST /support/call-requests — works for guests and logged-in users.
// Resolves with the server body ({ message, data: { requestId, openNow, expectedCallFrom } }).
export const createCallRequest = async (data) => {
  const res = await apiClient.post("/support/call-requests", data);
  return res.data;
};

export const getMyCallRequests = async () => {
  const res = await apiClient.get("/support/call-requests/mine");
  return res.data.data;
};
