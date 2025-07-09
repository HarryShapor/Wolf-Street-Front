import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import AuthPromoBanner from "./components/AuthPromoBanner";
import AuthSuccessMessage from "../../components/ui/AuthSuccessMessage";
import ToastModal from '../../components/ui/ToastModal';

const LoginPage: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState<{open: boolean, message: string, type?: 'success'|'error'|'info', title?: string}>({open: false, message: ''});
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const profileUpdated = params.get('profileUpdated') === '1';
  // const passwordChanged = params.get('passwordChanged') === '1';

  const promoFeatures = [
    { text: "Реальные котировки" },
    { text: "Инструменты анализа" },
    { text: "Низкие комиссии" },
    { text: "Безопасность средств" },
  ];

  const showToast = (opts: {message: string, type?: 'success'|'error'|'info', title?: string}) => {
    setToast({open: true, ...opts});
  };

  // Показывать toast при profileUpdated
  useEffect(() => {
    if (profileUpdated) setToast({open: true, message: "Профиль успешно обновлён. Войдите с новыми данными. Если не удаётся войти — попробуйте позже или обратитесь в поддержку.", type: "success"});
  }, [profileUpdated]);

  if (success) {
    return (
      <AuthSuccessMessage
        title="Вход выполнен!"
        message="Добро пожаловать! Перенаправляем вас..."
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-light-bg dark:bg-dark-bg">
      <ToastModal
        open={toast.open}
        onClose={() => setToast({...toast, open: false})}
        title={toast.title}
        message={toast.message}
        type={toast.type}
        duration={3000}
      />
      <div className="w-full max-w-5xl mb-4 flex justify-start">
        <Link
          to="/"
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
          Вернуться на главную
        </Link>
      </div>

      <div className="w-full max-w-5xl rounded-2xl card-glow fade-in overflow-hidden border-2 border-light-accent dark:border-dark-accent shadow-2xl">
        <div className="grid lg:grid-cols-3 h-[600px]">
          <div className="lg:col-span-2 flex flex-col justify-center">
            {profileUpdated && false && (
              <div className="mb-4 p-3 rounded bg-green-100 text-green-800 border border-green-300 text-center text-[15px] dark:bg-green-900 dark:text-green-200 dark:border-green-700">
                Профиль успешно обновлён. Войдите с новыми данными.<br/>
                Если не удаётся войти — попробуйте позже или обратитесь в поддержку.
              </div>
            )}
            {/* Уведомление о смене пароля убрано */}
            <LoginForm onSuccess={() => setSuccess(true)} showToast={showToast} />
          </div>

          <AuthPromoBanner
            title="Еще не являетесь участником?"
            subtitle="Это не проблема! Присоединяйтесь к Wolf Street и получите доступ к профессиональной торговой платформе."
            features={promoFeatures}
            ctaText="Начните торговать уже сегодня!"
            ctaLink="/register"
            ctaButtonText="Зарегистрироваться"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
