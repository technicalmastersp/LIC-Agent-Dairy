import apiClient from "../api/apiClient";

export const createSuggestion = async (data) => {
  const res = await apiClient.post("/suggestions", data);
  return res.data;
};

export const getMySuggestions = async () => {
  const res = await apiClient.get("/suggestions/mine");
  return res.data.data;
};