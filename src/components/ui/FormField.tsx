import { useState } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type: string;
  value: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export default function FormField({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  className = "",
}: FormFieldProps) {
  const [showPassword, setShowPassword] = useState(false);

  // Определяем, является ли поле паролем
  const isPasswordField = type === "password";
  // Используем фактический тип поля
  const inputType = isPasswordField && showPassword ? "text" : type;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={className}>
      <label
        htmlFor={name}
        className="block text-sm font-medium mb-1 text-light-fg dark:text-dark-fg"
      >
        {label} {required && "*"}
      </label>
      <div className="relative">
        <input
          type={inputType}
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full px-3 py-2.5 rounded-lg focus:outline-none transition-all duration-300 ease-in-out
            ${isPasswordField ? "pr-12" : "pr-3"}
            bg-white dark:bg-[#18191c]
            text-light-fg dark:text-[#b0b3b8]
            border-2 border-light-border dark:border-[#3e3c3a]
            shadow-inner dark:shadow-inner
            placeholder:text-light-fg/60 dark:placeholder:text-[#888c94]
            ${
              error
                ? "border-error-border bg-white text-error-text dark:bg-dark-error-bg dark:text-dark-error-text"
                : "hover:border-light-accent dark:hover:border-dark-accent dark:hover:bg-[#2a2b2a]/90"
            }
            focus:border-light-accent dark:focus:border-dark-accent
            focus:shadow-[0_0_0_3px_rgba(197,107,98,0.2)] dark:focus:shadow-[0_0_0_3px_rgba(129,199,132,0.2)]
          `}
          placeholder={placeholder}
        />

        {/* Кнопка показать/скрыть пароль */}
        {isPasswordField && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-light-fg dark:text-dark-fg opacity-60 hover:opacity-100 transition-opacity duration-200 focus:outline-none focus:opacity-100"
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            {showPassword ? (
              // Иконка "скрыть" (зачеркнутый глаз)
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.94 17.94A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 012.519-3.568M6.343 6.343A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.97 9.97 0 01-2.519 3.568M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <line
                  x1="3"
                  y1="3"
                  x2="21"
                  y2="21"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              // Иконка "показать" (открытый глаз)
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-error-text dark:text-dark-error-text transition-all duration-300 ease-in-out">
          {error}
        </p>
      )}
    </div>
  );
}
