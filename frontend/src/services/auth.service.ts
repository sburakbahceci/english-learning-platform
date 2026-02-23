import api from './api';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export const authService = {
  // Register
  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  // Verify email
  async verifyEmail(data: VerifyEmailData) {
    const response = await api.post('/auth/verify-email', data);
    return response.data;
  },

  // Resend verification code
  async resendCode(email: string) {
    const response = await api.post('/auth/resend-code', { email });
    return response.data;
  },

  // Login
  async login(data: LoginData) {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // Forgot password
  async forgotPassword(email: string) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  // Reset password
  async resetPassword(token: string, password: string) {
    const response = await api.post('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },

  // Get current user
  async getCurrentUser(token: string) {
    const response = await api.get('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },
};
