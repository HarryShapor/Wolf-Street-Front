// Универсальный компонент Loader
export function Loader({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-b-2 border-light-accent dark:border-dark-accent ${className}`}
      style={{ width: size, height: size, borderWidth: size / 12 }}
    />
  );
}

// Новый компонент LoaderBlock с кастомной анимацией
export function LoaderBlock({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="relative flex items-center justify-center mb-4">
        {/* Внешний спиннер */}
        <div className="animate-spin-slow rounded-full border-4 border-light-accent/30 dark:border-dark-accent/30 border-t-light-accent dark:border-t-dark-accent w-12 h-12 absolute" />
        {/* Внутренний пульс */}
        <div className="animate-pulse rounded-full bg-light-accent/80 dark:bg-dark-accent/80 w-6 h-6" />
      </div>
      <div className="text-light-fg dark:text-dark-fg text-lg font-semibold mt-2">{text}</div>
    </div>
  );
}

// Универсальный компонент ErrorBlock для ошибок загрузки
export function ErrorBlock({ text, onRetry }: { text: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="mb-4">
        <svg className="w-12 h-12 text-red-400 dark:text-red-500 animate-bounce" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.2" fill="none" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
        </svg>
      </div>
      <div className="text-red-500 dark:text-red-400 text-lg font-semibold mb-2">{text}</div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-6 py-2 rounded-lg bg-light-accent dark:bg-dark-accent text-white font-semibold shadow hover:bg-light-brown dark:hover:bg-dark-brown transition"
        >
          Повторить попытку
        </button>
      )}
    </div>
  );
}

interface LoadingButtonProps {
  isLoading: boolean;
  loadingText: string;
  children: React.ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function LoadingButton({
  isLoading,
  loadingText,
  children,
  type = "button",
  disabled = false,
  className = "",
  onClick,
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      disabled={isLoading || disabled}
      onClick={onClick}
      className={`w-full py-2.5 px-4 rounded-lg font-medium focus:outline-none transition-all duration-300 ease-in-out 
        disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center
        bg-light-accent dark:bg-dark-accent 
        text-light-bg dark:text-dark-bg
        hover:bg-light-brown dark:hover:bg-dark-brown
        hover:scale-105 active:scale-95
        shadow-[0_0_0_2px_rgba(197,107,98,0.2)] dark:shadow-[0_0_0_2px_rgba(129,199,132,0.2)]
        focus:shadow-[0_0_0_4px_rgba(197,107,98,0.3)] dark:focus:shadow-[0_0_0_4px_rgba(129,199,132,0.3)]
        ${className}`}
    >
      {isLoading ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-light-bg dark:border-dark-bg mr-2"></div>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
