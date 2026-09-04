import apiClient from '../api/apiClient';

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
  
  if(res.data.status !== 'error') {
    // No setToken() anymore — the backend's Set-Cookie header on this same
    // response already put the httpOnly auth cookie in place; there's
    // nothing left for the client to store.
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

  return res.data; // { statusCode, message, emailChanged, userInfo }
};

export const completeOnboarding = async () => {
  const res = await apiClient.post('/auth/complete-onboarding');
  return res.data;
};

export const updateProfileImage = async (image) => {
  const res = await apiClient.put("/user/profile-image", { image });
  return res.data;
};

export const removeProfileImage = async () => {
  const res = await apiClient.delete("/user/profile-image");
  return res.data;
};

export const logoutCurrentUser = async () => {
  const user = JSON.parse(localStorage.getItem('currentUser'))
  if (user?.name) localStorage.setItem('userName', user.name)
  localStorage.removeItem('currentUser');
  // No clearToken() anymore — there's no client-readable token to clear.
  // The httpOnly cookie can only be removed by the server, hence this call.
  try {
    await apiClient.post('/auth/logout');
  } catch {
    // Best-effort — if this fails the cookie just sits until its own
    // expiry. Either way the local session state above is already
    // cleared, so the app treats the user as logged out regardless.
  }
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

export const verifyEmail = async (token) => {
  let status;
  try {
    const res = await apiClient.get(`/auth/verify-email?token=${token}`);
    const code = res.data.code;
    if (code === "VERIFIED")          status="success";
    else if (code === "ALREADY_VERIFIED") status="already";
    else status="invalid";
    return { status, message: res.data.message };
  } catch (error) {
    const code = error.response?.data?.code;
    if (code === "TOKEN_EXPIRED") status="expired";
    else status = "invalid";
    return { status, message: error.response?.data?.message || "An error occurred" };
  }
};

export const resendVerification = async (email) => {
  let resendMsg = "";
  let isResendng = true;
  try {
    await apiClient.post("/auth/resend-verification", { email });
    resendMsg="Verification link sent! Please check your inbox or spam folder.";
  } catch (err) {
    resendMsg = err.response?.data?.message || "Something went wrong.";
  } finally { isResendng = false; }
  return { resendMsg, isResendng };
};

export const getMyActivity = async (params = {}) => {
  const q = new URLSearchParams(params).toString();
  const res = await apiClient.get(`/user/my-activity?${q}`);
  return res.data.data; // { logs, pagination }
};

export const getNotificationPreferences = async () => {
  const res = await apiClient.get("/user/notification-preferences");
  return res.data.data; // { policyDueReminders, subscriptionReminders }
};

export const updateNotificationPreferences = async (prefs) => {
  // prefs: { policyDueReminders?: boolean, subscriptionReminders?: boolean }
  const res = await apiClient.put("/user/notification-preferences", prefs);
  return res.data; // { statusCode, message, data }
};

export const getMySessions = async () => {
  const res = await apiClient.get("/user/sessions");
  return res.data.data; // array of { sessionId, device, ip, createdAt, isCurrent }
};

export const revokeSession = async (sessionId) => {
  const res = await apiClient.delete(`/user/sessions/${sessionId}`);
  return res.data;
};

export const revokeOtherSessions = async () => {
  const res = await apiClient.post("/user/sessions/logout-others");
  return res.data;
};