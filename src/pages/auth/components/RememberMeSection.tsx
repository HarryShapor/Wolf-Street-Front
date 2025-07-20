import { Link } from "react-router-dom";

interface RememberMeSectionProps {
  rememberMe: boolean;
  onRememberMeChange: (checked: boolean) => void;
}

export default function RememberMeSection({
  rememberMe,
  onRememberMeChange,
}: RememberMeSectionProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onRememberMeChange(!rememberMe)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none border-2 shadow-md
            ${rememberMe
              ? "bg-light-accent dark:bg-dark-accent border-light-accent dark:border-dark-accent ring-2 ring-light-accent/30 dark:ring-dark-accent/40"
              : "bg-light-card dark:bg-dark-card border-light-border dark:border-dark-border"
            }`}
          aria-label="Запомнить меня"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full shadow-lg transition-transform duration-200 ease-in-out
              ${rememberMe
                ? "bg-white ring-2 ring-light-accent dark:bg-dark-fg dark:ring-dark-accent"
                : "bg-light-border dark:bg-dark-border"
              }
              ${rememberMe ? "translate-x-6" : "translate-x-1"}
            `}
          />
        </button>

        <label
          onClick={() => onRememberMeChange(!rememberMe)}
          className="text-sm cursor-pointer text-light-fg dark:text-dark-fg select-none hover:text-light-accent dark:hover:text-dark-accent transition-colors duration-200"
        >
          Запомнить меня
        </label>
      </div>

      <Link
        to="/forgot-password"
        className="text-sm font-medium hover:underline transition-all duration-200 text-light-accent dark:text-dark-accent hover:text-light-fg/80 dark:hover:text-dark-brown"
      >
        Забыли пароль?
      </Link>
    </div>
  );
}
