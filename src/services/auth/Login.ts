import api from "../Api";
import type { LoginRequest, LoginResponse } from "./TypesAuth";
import { handleApiError } from "./handleApiError";

/**
 * Вход пользователя в систему
 * @param credentials - данные для входа (username, password)
 * @returns Promise с токенами доступа
 */
export const loginUser = async (
  credentials: LoginRequest
): Promise<LoginResponse> => {
  try {
    const response = await api.post("/auth/login", credentials);
    return response.data as LoginResponse;
  } catch (error: unknown) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Сохранение токенов в localStorage
 * @param tokens - объект с токенами
 */
export const saveTokens = (tokens: LoginResponse): void => {
  localStorage.setItem("accessToken", tokens.accessToken);
  localStorage.setItem("refreshToken", tokens.refreshToken);
  localStorage.removeItem("logout"); // Удаляем флаг logout при успешном логине
};

/**
 * Получение токена доступа из localStorage
 * @returns accessToken или null
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem("accessToken");
};

/**
 * Получение refresh токена из localStorage
 * @returns refreshToken или null
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem("refreshToken");
};

/**
 * Проверка, авторизован ли пользователь
 * @returns true если есть токен доступа
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

/**
 * Удаление токенов из localStorage (выход из системы)
 */
export const clearTokens = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

/**
 * Выход из системы
 */
export const logout = (): void => {
  clearTokens();
  localStorage.setItem('logout', 'true'); // Ставим флаг logout
  // Перенаправление теперь должно происходить на уровне компонента через navigate
  // window.location.href = "/login";
};
