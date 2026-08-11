import api from './api';

export const authService = {
  login: (payload) => api.post('/auth/login', payload).then((r) => r.data.data),
  me: () => api.get('/auth/me').then((r) => r.data.data),
  logout: () => api.post('/auth/logout').catch(() => null),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }).then((r) => r.data),
  resetPassword: (payload) => api.post('/auth/reset-password', payload).then((r) => r.data),
  changePassword: (payload) => api.put('/auth/password', payload).then((r) => r.data),
  updateProfile: (formData) => api.put('/auth/profile', formData).then((r) => r.data.data),
};
