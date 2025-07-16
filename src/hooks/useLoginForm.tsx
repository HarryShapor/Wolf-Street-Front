import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, saveTokens } from "../services/auth/Login";
import type { LoginRequest } from "../services/auth/TypesAuth";
import Cookies from "js-cookie";
import CryptoJS from "crypto-js";

const PASSWORD_COOKIE_KEY = "password";
const PASSWORD_ENCRYPT_KEY = "demo-key";

interface UseLoginFormProps {
  onSuccess: () => void;
}

export function useLoginForm({ onSuccess }: UseLoginFormProps) {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    // При загрузке читаем cookie
    const remembered = Cookies.get("rememberMe") === "true";
    setRememberMe(remembered);
    // Расшифровываем пароль из cookie, если есть
    const encrypted = Cookies.get(PASSWORD_COOKIE_KEY);
    let username = "";
    if (remembered) {
      username = Cookies.get('rememberedUsername') || "";
    }
    setFormData(prev => ({
      ...prev,
      username,
    }));
    if (encrypted) {
      try {
        const bytes = CryptoJS.AES.decrypt(encrypted, PASSWORD_ENCRYPT_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        setFormData(prev => ({ ...prev, password: decrypted }));
      } catch {}
    }
  }, []);

  const [formData, setFormData] = useState<LoginRequest>({
    username: "",
    password: "",
  });

  const [validation, setValidation] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Очистка ошибок при изменении поля
      if (validation[name as keyof typeof validation]) {
        setValidation((prev) => ({
          ...prev,
          [name]: "",
        }));
      }

      setError("");
    },
    [validation]
  );

  const handleRememberMeChange = useCallback((checked: boolean) => {
    setRememberMe(checked);
    Cookies.set("rememberMe", checked ? "true" : "false", { expires: 30 });
  }, []);

  const validateForm = useCallback((): boolean => {
    const newValidation = {
      username: "",
      password: "",
    };

    let isValid = true;

    if (!formData.username.trim()) {
      newValidation.username = "Имя пользователя обязательно";
      isValid = false;
    }

    if (!formData.password) {
      newValidation.password = "Пароль обязателен";
      isValid = false;
    }

    setValidation(newValidation);
    return isValid;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsLoading(true);
      setError("");

      let finished = false;
      const timeout = setTimeout(() => {
        if (!finished) {
          finished = true;
          setIsLoading(false);
          setError('Сервер не отвечает. Попробуйте позже.');
          if (typeof window !== 'undefined' && window.dispatchEvent) {
            const event = new CustomEvent('loginErrorToast', { detail: 'Сервер не отвечает. Попробуйте позже.' });
            window.dispatchEvent(event);
          }
        }
      }, 2000);
      try {
        const tokens = await loginUser(formData);
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        saveTokens(tokens);
        // Сохраняем пароль в cookie, если rememberMe (шифруем)
        if (rememberMe) {
          const encrypted = CryptoJS.AES.encrypt(formData.password, PASSWORD_ENCRYPT_KEY).toString();
          Cookies.set(PASSWORD_COOKIE_KEY, encrypted, { expires: 30 });
          Cookies.set('rememberedUsername', formData.username, { expires: 30 }); // Сохраняем username
        } else {
          Cookies.remove(PASSWORD_COOKIE_KEY);
          Cookies.remove('rememberedUsername');
        }
        onSuccess();
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } catch (err) {
        if (finished) return;
        finished = true;
        clearTimeout(timeout);
        let msg = err instanceof Error ? err.message : "Произошла ошибка при входе";
        if (/invalid token|jwt|token|Unauthorized|401|403/i.test(msg)) {
          msg = "Неверные имя пользователя или пароль.";
        }
        setError(msg);
        if (msg) {
          setTimeout(() => {
            if (typeof window !== 'undefined' && window.dispatchEvent) {
              const event = new CustomEvent('loginErrorToast', { detail: msg });
              window.dispatchEvent(event);
            }
          }, 10);
        }
      } finally {
        clearTimeout(timeout);
        setIsLoading(false);
      }
    },
    [formData, validateForm, onSuccess, navigate, rememberMe]
  );

  return {
    formData,
    rememberMe,
    isLoading,
    error,
    validation,
    handleInputChange,
    handleRememberMeChange,
    handleSubmit,
  };
}
