export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface TokenRefreshRequest {
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}
