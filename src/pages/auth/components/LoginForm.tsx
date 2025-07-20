import FormField from "../../../components/ui/FormField";
import LoadingButton from "../../../components/ui/LoadingButton";
import ErrorAlert from "../../../components/ui/ErrorAlert";
import RememberMeSection from "./RememberMeSection";
import { useLoginForm } from "../../../hooks/useLoginForm";
import { useEffect, useRef } from 'react';

interface LoginFormProps {
  onSuccess: () => void;
  showToast: (opts: {message: string, type?: 'success'|'error'|'info', title?: string}) => void;
}

export default function LoginForm({ onSuccess, showToast }: LoginFormProps) {
  const {
    formData,
    rememberMe,
    isLoading,
    error,
    validation,
    handleInputChange,
    handleRememberMeChange,
    handleSubmit,
  } = useLoginForm({ onSuccess });

  useEffect(() => {
    if (error) {
      showToast({message: error, type: 'error', title: 'Ошибка входа'});
    }
    // Подписка на кастомное событие для повторного показа ошибки
    const handler = (e: any) => {
      showToast({message: e.detail, type: 'error', title: 'Ошибка входа'});
    };
    window.addEventListener('loginErrorToast', handler);
    return () => window.removeEventListener('loginErrorToast', handler);
  }, [error, showToast]);

  return (
    <div className="lg:col-span-2 p-8 flex flex-col min-h-[600px] bg-light-card dark:bg-neutral-950 border-r border-light-border dark:border-dark-border">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2 text-light-accent dark:text-dark-accent">
          Вход в систему
        </h1>
        <p className="text-light-fg dark:text-dark-fg">
          Добро пожаловать в Wolf Street
        </p>
      </div>

      {/* Ошибки теперь через toast */}
      {/* <ErrorAlert error={error} /> */}

      {/* Форма с кнопкой внутри */}
      <form onSubmit={handleSubmit} className="flex flex-col flex-1 max-w-md">
        <div className="space-y-4">
          <FormField
            label="Имя пользователя"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Введите имя пользователя"
            required
            error={validation.username}
            className="login-field "
          />

          <FormField
            label="Пароль"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Введите пароль"
            required
            error={validation.password}
            className="login-field"
          />

          <RememberMeSection
            rememberMe={rememberMe}
            onRememberMeChange={handleRememberMeChange}
          />
        </div>

        {/* Кнопка с transform для сдвига вверх */}
        <div className="mt-auto transform -translate-y-1">
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            loadingText="Вход в систему..."
            className="max-w-md"
          >
            Войти
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
