import api from './api';

export const authService = {
  // Get Google OAuth URL
  async getGoogleAuthUrl() {
    const response = await api.get('/auth/google');
    return response.data;
  },

  // Verify token
  async verifyToken() {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('auth-token');
    window.location.href = '/';
  },
};
