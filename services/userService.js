import apiClient from '../api/apiClient';

export const createUser = async (userData) => {
  const res = await apiClient.post('/users', userData);
  return res.data;
};

export const login = async (credentials) => {
  const res = await apiClient.post('/auth/login', credentials);
  return res.data;
};

export const getProfile = async () => {
  const res = await apiClient.get('/users/profile');
  return res.data;
};
