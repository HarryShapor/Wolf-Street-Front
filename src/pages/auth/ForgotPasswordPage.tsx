import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthFormHeader from "./components/AuthFormHeader";
import AuthFormFooter from "./components/AuthFormFooter";
import ErrorAlert from "../../components/ui/ErrorAlert";
import axios from "axios";
import { API_HOST } from '../../services/Api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const API_BASE = `${API_HOST}/user-service/api/v1`;

const ForgotPasswordPage: React.FC = () => {
  const query = useQuery();
  const token = query.get("token");
  const emailFromQuery = query.get("email");

  // --- Состояния для email формы ---
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // --- Состояния для смены пароля ---
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changeSuccess, setChangeSuccess] = useState(false);
  const [changeError, setChangeError] = useState("");
  const [changeLoading, setChangeLoading] = useState(false);

  // --- Проверка email и отправка письма ---
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotFound(false);
    setIsLoading(true);
    try {
      // ОТКЛЮЧЕНО: Проверка существования email
      // const res = await axios.get(`${API_BASE}/user/me`, { params: { email } });
      // if (!res.data || !res.data.email) {
      //   setNotFound(true);
      //   setIsLoading(false);
      //   return;
      // }
      // Отправка письма (заглушка, заменить на реальный эндпоинт)
      // await axios.post(`${API_BASE}/auth/forgot-password`, { email });
      setSuccess(true);
    } catch (err: any) {
      setError("Ошибка при отправке запроса на восстановление пароля");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Смена пароля ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError("");
    setChangeLoading(true);
    if (newPassword !== confirmPassword) {
      setChangeError("Пароли не совпадают");
      setChangeLoading(false);
      return;
    }
    try {
      // Отправка нового пароля на реальный эндпоинт
      await axios.post(`${API_BASE}/auth/change-password`, {
        email: emailFromQuery,
        token,
        newPassword,
      });
      setChangeSuccess(true);
    } catch (err) {
      setChangeError("Ошибка при смене пароля");
    } finally {
      setChangeLoading(false);
    }
  };

  // --- UI для смены пароля ---
  if (token && emailFromQuery) {
    if (changeSuccess) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-light-bg dark:bg-dark-bg">
          <div className="max-w-md w-full rounded-2xl card-glow fade-in overflow-hidden bg-light-card dark:bg-dark-card border-2 border-light-accent dark:border-dark-accent shadow-2xl p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold mb-4 text-light-accent dark:text-dark-accent">Пароль успешно изменён!</h2>
            <Link to="/login" className="text-light-accent dark:text-dark-accent hover:text-light-fg/80 dark:hover:text-dark-brown font-medium underline">Войти</Link>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-light-bg dark:bg-dark-bg">
        <div className="max-w-md w-full rounded-2xl card-glow fade-in overflow-hidden bg-light-card dark:bg-dark-card border-2 border-light-accent dark:border-dark-accent shadow-2xl">
          <AuthFormHeader
            title="Смена пароля"
            subtitle={`Email: ${emailFromQuery}`}
          />
          <form className="px-8 pt-4 pb-2" onSubmit={handleChangePassword}>
            <ErrorAlert error={changeError} />
            <div className="mb-4">
              <label htmlFor="newPassword" className="block text-sm font-medium text-light-fg dark:text-dark-fg mb-1">
                Новый пароль
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                placeholder="Введите новый пароль"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-light-fg dark:text-dark-fg mb-1">
                Подтверждение пароля
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
                placeholder="Повторите новый пароль"
              />
            </div>
            <button
              type="submit"
              disabled={changeLoading}
              className="w-full py-2 rounded-lg bg-light-accent dark:bg-dark-accent text-white font-semibold hover:bg-light-brown dark:hover:bg-dark-brown transition-colors duration-200 disabled:opacity-60"
            >
              {changeLoading ? "Сохранение..." : "Сменить пароль"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- UI для email формы ---
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-light-bg dark:bg-dark-bg">
        <div className="max-w-md w-full rounded-2xl card-glow fade-in overflow-hidden bg-light-card dark:bg-dark-card border-2 border-light-accent dark:border-dark-accent shadow-2xl p-8 flex flex-col items-center">
          <h2 className="text-2xl font-bold mb-4 text-light-accent dark:text-dark-accent">Письмо отправлено!</h2>
          <p className="text-light-fg dark:text-dark-fg mb-4 text-center">Если такой email зарегистрирован, на него отправлено письмо с инструкциями по восстановлению пароля.</p>
          <Link to="/login" className="text-light-accent dark:text-dark-accent hover:text-light-fg/80 dark:hover:text-dark-brown font-medium underline">Вернуться к входу</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-light-bg dark:bg-dark-bg">
      <div className="w-full max-w-md mb-4 flex justify-start">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-light-accent dark:text-dark-accent hover:text-light-fg/80 dark:hover:text-dark-brown transition-colors duration-200"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Вернуться к входу
        </Link>
      </div>
      <div className="max-w-md w-full rounded-2xl card-glow fade-in overflow-hidden bg-light-card dark:bg-dark-card border-2 border-light-accent dark:border-dark-accent shadow-2xl">
        <AuthFormHeader
          title="Восстановление пароля"
          subtitle="Введите email, чтобы получить ссылку для сброса пароля"
        />
        <form className="px-8 pt-4 pb-2" onSubmit={handleEmailSubmit}>
          <ErrorAlert error={error} />
          {notFound && (
            <div className="mb-4 text-red-500 text-sm">
              Такой email не найден. <Link to="/register" className="underline text-light-accent">Зарегистрироваться</Link>
            </div>
          )}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-light-fg dark:text-dark-fg mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent"
              placeholder="Введите ваш email"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 rounded-lg bg-light-accent dark:bg-dark-accent text-white font-semibold hover:bg-light-brown dark:hover:bg-dark-brown transition-colors duration-200 disabled:opacity-60"
          >
            {isLoading ? "Отправка..." : "Восстановить пароль"}
          </button>
        </form>
        <AuthFormFooter
          text="Вспомнили пароль?"
          linkText="Войти"
          linkTo="/login"
        />
      </div>
    </div>
  );
};

export default ForgotPasswordPage; 