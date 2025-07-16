import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/auth/Register";
import { loginUser, saveTokens } from "../services/auth/Login";
import type { RegisterRequest } from "../services/auth/TypesAuth";
import { useFormValidation } from "./useFormValidation";

interface UseMultiStepRegisterProps {
  onSuccess: () => void;
}

export function useMultiStepRegister({ onSuccess }: UseMultiStepRegisterProps) {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState<RegisterRequest>({
    username: "",
    password: "",
    email: "",
    firstname: "",
    lastname: "",
    phone: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");

  const {
    errors: validation,
    clearError,
    clearAllErrors,
    validateField,
    validateForm,
  } = useFormValidation();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;

      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Очистка ошибок при изменении поля
      if (validation[name as keyof typeof validation]) {
        clearError(name as keyof typeof validation);
      }

      setError("");
    },
    [validation, clearError]
  );

  const handleConfirmPasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setConfirmPassword(value);

      if (validation.confirmPassword) {
        clearError("confirmPassword");
      }
    },
    [validation.confirmPassword, clearError]
  );

  // Валидация первого шага
  const validateStep1 = useCallback((): boolean => {
    const step1Errors = {
      username: !formData.username.trim() ? "Имя пользователя обязательно" : "",
      email: !formData.email
        ? "Email обязателен"
        : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ? "Введите корректный email"
        : "",
    };

    // Обновляем только ошибки первого шага
    Object.entries(step1Errors).forEach(([field, error]) => {
      if (error) {
        validateField(
          field as keyof typeof validation,
          formData[field as keyof RegisterRequest] as string
        );
      }
    });

    return !Object.values(step1Errors).some((error) => error !== "");
  }, [formData, validateField]);

  // Переход к следующему шагу
  const nextStep = useCallback(() => {
    if (currentStep === 1) {
      if (validateStep1()) {
        setCurrentStep(2);
        clearAllErrors();
      }
    }
  }, [currentStep, validateStep1, clearAllErrors]);

  // Возврат к предыдущему шагу
  const prevStep = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      clearAllErrors();
    }
  }, [currentStep, clearAllErrors]);

  // Финальная отправка формы
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm(formData, confirmPassword)) {
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        const registrationData: RegisterRequest = {
          username: formData.username,
          password: formData.password,
          email: formData.email,
          ...(formData.firstname && { firstname: formData.firstname }),
          ...(formData.lastname && { lastname: formData.lastname }),
          ...(formData.phone && { phone: formData.phone }),
        };

        await registerUser(registrationData);
        // Автоматический логин после успешной регистрации
        try {
          const tokens = await loginUser({ username: registrationData.username, password: registrationData.password });
          saveTokens(tokens);
          onSuccess();
        } catch (loginErr) {
          setError("Регистрация прошла, но не удалось войти автоматически. Попробуйте войти вручную.");
        }
      } catch (err) {
        let msg = err instanceof Error ? err.message : "Произошла ошибка при регистрации";
        if (/invalid token|jwt|token|Unauthorized|401|403/i.test(msg)) {
          msg = "Ошибка регистрации. Проверьте данные и попробуйте снова.";
        }
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    },
    [formData, confirmPassword, validateForm, onSuccess, navigate]
  );

  return {
    // Состояние
    currentStep,
    formData,
    confirmPassword,
    isLoading,
    error,
    validation,

    // Обработчики
    handleInputChange,
    handleConfirmPasswordChange,
    handleSubmit,
    nextStep,
    prevStep,

    // Утилиты
    clearError,
    clearAllErrors,
    validateField,
  };
}
