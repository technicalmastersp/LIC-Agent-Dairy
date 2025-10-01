import apiClient from '../api/apiClient';

export const createRecord = async (data) => {
  const res = await apiClient.post('/records', data);
  return res.data;
};

export const getAllRecords = async () => {
  const res = await apiClient.get('/records');
  return res.data;
};

export const updateRecord = async (id, data) => {
  const res = await apiClient.put(`/records/${id}`, data);
  return res.data;
};

export const deleteRecord = async (id) => {
  const res = await apiClient.delete(`/records/${id}`);
  return res.data;
};
