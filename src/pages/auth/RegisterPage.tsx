import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthFormHeader from "./components/AuthFormHeader";
import AuthFormFooter from "./components/AuthFormFooter";
import RegisterForm from "./components/RegisterForm";
import ToastModal from '../trade/ToastModal';

const RegisterPage: React.FC = () => {
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [toast, setToast] = useState<{open: boolean, message: string, type?: 'success'|'error'|'info', title?: string}>({open: false, message: ''});

  const showToast = (opts: {message: string, type?: 'success'|'error'|'info', title?: string}) => {
    setToast({open: true, ...opts});
  };

  useEffect(() => {
    if (success) {
      navigate("/", { replace: true });
    }
  }, [success, navigate]);

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
      {/* Кнопка возврата на главную */}
      <div className="w-full max-w-md mb-4 flex justify-start">
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

      {/* Добавляем анимационные классы к существующей структуре */}
      <div className="max-w-md w-full rounded-2xl card-glow fade-in overflow-hidden bg-light-card dark:bg-dark-card border-2 border-light-accent dark:border-dark-accent shadow-2xl">
        {/* Используем готовый AuthFormHeader */}
        <AuthFormHeader
          title="Создать аккаунт"
          subtitle="Присоединяйтесь к Wolf Street"
        />

        {/* Используем готовый RegisterForm */}
        <RegisterForm onSuccess={() => setSuccess(true)} showToast={showToast} />

        {/* Используем готовый AuthFormFooter */}
        <AuthFormFooter
          text="Уже есть аккаунт?"
          linkText="Войти"
          linkTo="/login"
        />
      </div>
    </div>
  );
};

export default RegisterPage;
