import apiClient from '../api/apiClient';
import { setToken, clearToken } from '../utils/localStorageHelper';

export const createUser = async (userData) => {
  const res = await apiClient.post('/auth/register', userData);
  return res.data;
};

export const checkReferralCode = async (code) => {
  const body = { "referralCode": code };
  const res = await apiClient.post('/auth/validateReferralCode', body);

  if (res.data.valid === true) {
    return { valid: true, message: res.data.referrer.message };
  } else {
    return false;
  }
};

export const login = async (credentials) => {
  const res = await apiClient.post('/auth/login', credentials);
  // console.log('login responce : ', res.data);
  
  if(res.data.status !== 'error') {
    setToken(res.data.token)
    localStorage.removeItem('userName')
    return res.data;
  } else {
    throw new Error(res.data.message);
  }
};

export const getProfile = async () => {
  const res = await apiClient.get('/auth/profile');
  return res.data.userInfo;
};

export const updateProfile = async (profileData) => {
  const res = await apiClient.put('/auth/updateUserProfile', profileData);
  
  return res.data.userInfo;
};

export const logoutCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('currentUser'))
  localStorage.setItem('userName', user.name)
  localStorage.removeItem('currentUser');
  clearToken()
};

export const forgotPassword = async (data) => {
  // { email: string }
  const res = await apiClient.post("/auth/forgot-password", data);
  return res.data;
};

export const verifyOTP = async (data) => {
  // { email: string; otp: string }
  const res = await apiClient.post("/auth/verify-otp", data);
  return res.data;
};

export const resetPassword = async (data) => {
//  { email: string; otp: string; newPassword: string }
  const res = await apiClient.post("/auth/reset-password", data);
  return res.data;
};

export const changePassword = async (data) => {
  // { currentPassword: string; newPassword: string }
  const res = await apiClient.post("/auth/change-password", data);
  return res.data;
};