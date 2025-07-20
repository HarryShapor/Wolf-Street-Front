import { useState, useCallback } from "react";
import type { RegisterRequest } from "../services/auth/TypesAuth";

interface ValidationErrors {
  username: string;
  password: string;
  email: string;
  confirmPassword: string;
  [key: string]: string;
}

interface ValidationRules {
  username: (value: string) => string;
  password: (value: string) => string;
  email: (value: string) => string;
  confirmPassword: (value: string, password: string) => string;
}

const validationRules: ValidationRules = {
  username: (value: string) => {
    if (!value.trim()) return "Имя пользователя обязательно";
    if (value.length < 3)
      return "Имя пользователя должно содержать минимум 3 символа";
    return "";
  },

  password: (value: string) => {
    if (!value) return "Пароль обязателен";
    if (value.length < 6) return "Пароль должен содержать минимум 6 символов";
    return "";
  },

  email: (value: string) => {
    if (!value) return "Email обязателен";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      return "Введите корректный email";
    return "";
  },

  confirmPassword: (value: string, password: string) => {
    if (!value) return "Подтверждение пароля обязательно";
    if (value !== password) return "Пароли не совпадают";
    return "";
  },
};

export function useFormValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({
    username: "",
    password: "",
    email: "",
    confirmPassword: "",
  });

  const clearError = useCallback((field: keyof ValidationErrors) => {
    setErrors((prev) => ({
      ...prev,
      [field]: "",
    }));
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({
      username: "",
      password: "",
      email: "",
      confirmPassword: "",
    });
  }, []);

  const validateField = useCallback(
    (
      field: keyof ValidationErrors,
      value: string,
      additionalValue?: string
    ): string => {
      let error = "";

      switch (field) {
        case "username":
          error = validationRules.username(value);
          break;
        case "password":
          error = validationRules.password(value);
          break;
        case "email":
          error = validationRules.email(value);
          break;
        case "confirmPassword":
          error = validationRules.confirmPassword(value, additionalValue || "");
          break;
      }

      setErrors((prev) => ({
        ...prev,
        [field]: error,
      }));

      return error;
    },
    []
  );

  const validateForm = useCallback(
    (formData: RegisterRequest, confirmPassword: string): boolean => {
      const newErrors: ValidationErrors = {
        username: validationRules.username(formData.username),
        password: validationRules.password(formData.password),
        email: validationRules.email(formData.email),
        confirmPassword: validationRules.confirmPassword(
          confirmPassword,
          formData.password
        ),
      };

      setErrors(newErrors);

      // Проверяем, есть ли ошибки
      return !Object.values(newErrors).some((error) => error !== "");
    },
    []
  );

  return {
    errors,
    clearError,
    clearAllErrors,
    validateField,
    validateForm,
  };
}
