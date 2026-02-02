import { apiClient, ApiResponse, setAccessToken, setRefreshToken, clearTokens } from './client';
import type { User, AuthTokens, LoginCredentials, RegisterData } from '../types/api';

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export const authApi = {
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const { user, tokens } = response.data.data;
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    return { user, tokens };
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const { user, tokens } = response.data.data;
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    return { user, tokens };
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearTokens();
    }
  },

  async getProfile(): Promise<User> {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data.data;
  },

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    const response = await apiClient.post<ApiResponse<AuthTokens>>('/auth/refresh', { refreshToken });
    const tokens = response.data.data;
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    return tokens;
  },
};
