interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
  isVisible?: boolean;
}

export default function FeatureCard({
  icon,
  title,
  text,
  isVisible = true,
}: FeatureCardProps) {
  return (
    <div
      className={`bg-light-card dark:bg-dark-card rounded-2xl shadow-xl p-6 border-2 border-light-border dark:border-dark-border flex flex-col gap-4 items-center text-center h-full w-full justify-start transition-all duration-500 ease-out hover:scale-105 hover:shadow-2xl hover:border-light-accent/50 dark:hover:border-dark-accent/50 ${
        isVisible ? "transform-none" : "transform scale-95 opacity-0"
      }`}
    >
      {/* Анимация иконки */}
      <span
        className={`mb-2 transition-all duration-300 ${
          isVisible ? "scale-100 rotate-0" : "scale-75 rotate-12"
        }`}
      >
        {icon}
      </span>

      {/* Анимация заголовка - основной цвет */}
      <div
        className={`text-lg font-bold mb-1 text-light-fg dark:text-dark-fg transition-all duration-400 delay-100 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        {title}
      </div>

      {/* Анимация текста - приглушенный цвет как в Footer */}
      <div
        className={`text-light-fg/70 dark:text-dark-brown text-sm leading-[1.6] flex-1 flex items-start transition-all duration-500 delay-200 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
