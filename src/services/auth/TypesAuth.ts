export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  firstname?: string;
  lastname?: string;
  phone?: string;
}

// Типы для входа в систему
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}
