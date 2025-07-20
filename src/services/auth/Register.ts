import api from "../Api";
import type { RegisterRequest } from "./TypesAuth";
import { handleApiError } from "./handleApiError";

/**
 * Регистрация нового пользователя
 * @param userData - данные для регистрации
 * @returns Promise с ответом сервера
 */
export const registerUser = async (
  userData: RegisterRequest
): Promise<void> => {
  try {
    await api.post("/auth/register", userData);
  } catch (error: unknown) {
    handleApiError(error);
  }
};

/**
 * Экспорт по умолчанию для registerUser
 */
export default registerUser;
