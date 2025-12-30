import apiClient from '../api/apiClient';
import { getToken, setToken, clearToken } from '../utils/localStorageHelper'

export const createUser = async (userData) => {
  const res = await apiClient.post('/users', userData);
  return res.data;
};

export const login = async (credentials) => {
  const res = await apiClient.post('/auth/login', credentials);
  // console.log('login responce : ', res.data);
  
  setToken(res.data.token)
  localStorage.removeItem('userName')
  return res.data;
};

export const getProfile = async () => {
  const res = await apiClient.get('/auth/profile');
  return res.data;
};
