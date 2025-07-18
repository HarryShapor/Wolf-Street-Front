import { useTheme } from "../../context/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <section
      id="footer"
      className="snap-start min-h-screen w-full bg-light-card dark:bg-dark-card relative flex flex-col overflow-hidden"
    >
      {/* Декоративный фон */}
      <div className="absolute inset-0 bg-gradient-to-br from-light-card via-light-bg to-light-accent/5 dark:from-dark-card dark:via-dark-bg dark:to-dark-accent/10"></div>

      {/* Декоративные элементы */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-light-accent/10 dark:bg-dark-accent/10 rounded-full blur-3xl animate-pulse-slow"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-light-accent/5 dark:bg-dark-accent/5 rounded-full blur-3xl animate-pulse-slower"></div>

      {/* Основной контент футера */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 pt-32 flex-1 flex flex-col">
        {/* Главная секция с логотипом */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-[32px] relative inline-block w-12 h-12">
              {/* Светлый логотип */}
              <img
                src="/src/image/wolf_logo.svg"
                alt="Wolf Street"
                className={`w-12 h-12 absolute top-0 left-0 z-10 object-contain object-center transition-opacity duration-300 ease-in-out ${
                  theme === "light" ? "opacity-100" : "opacity-0"
                }`}
              />
              {/* Темный логотип */}
              <img
                src="/src/image/wolf_logo_for_black.png"
                alt="Wolf Street"
                className={`w-12 h-12 absolute top-0 left-0 z-10 object-contain object-center transition-opacity duration-300 ease-in-out ${
                  theme === "dark" ? "opacity-100" : "opacity-0"
                }`}
              />
            </span>
            <h2 className="text-3xl font-bold text-light-accent dark:text-dark-accent">
              Wolf Street
            </h2>
          </div>
          <p className="text-lg text-light-fg/70 dark:text-dark-brown max-w-xl mx-auto">
            Премиальная торговая платформа для управления капиталом и
            инвестирования
          </p>
        </div>

        {/* Социальные сети с SVG иконками */}
        <div className="text-center mb-20">
          <h3 className="text-xl font-semibold text-light-fg dark:text-dark-fg mb-8">
            Присоединяйтесь к сообществу
          </h3>
          <div className="flex gap-4 justify-center">
            <a
              href="#"
              className="w-12 h-12 bg-light-accent/10 dark:bg-dark-accent/10 hover:bg-light-accent dark:hover:bg-dark-accent rounded-xl flex items-center justify-center text-light-accent dark:text-dark-accent hover:text-white transition-all duration-300 hover:scale-105 shadow-lg"
              aria-label="Discord"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.196.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-light-accent/10 dark:bg-dark-accent/10 hover:bg-light-accent dark:hover:bg-dark-accent rounded-xl flex items-center justify-center text-light-accent dark:text-dark-accent hover:text-white transition-all duration-300 hover:scale-105 shadow-lg"
              aria-label="Telegram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12a12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472c-.18 1.898-.962 6.502-1.36 8.627c-.168.9-.499 1.201-.82 1.23c-.696.065-1.225-.46-1.9-.902c-1.056-.693-1.653-1.124-2.678-1.8c-1.185-.78-.417-1.21.258-1.91c.177-.184 3.247-2.977 3.307-3.23c.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345c-.48.33-.913.49-1.302.48c-.428-.008-1.252-.241-1.865-.44c-.752-.245-1.349-.374-1.297-.789c.027-.216.325-.437.893-.663c3.498-1.524 5.83-2.529 6.998-3.014c3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-light-accent/10 dark:bg-dark-accent/10 hover:bg-light-accent dark:hover:bg-dark-accent rounded-xl flex items-center justify-center text-light-accent dark:text-dark-accent hover:text-white transition-all duration-300 hover:scale-105 shadow-lg"
              aria-label="YouTube"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-light-accent/10 dark:bg-dark-accent/10 hover:bg-light-accent dark:hover:bg-dark-accent rounded-xl flex items-center justify-center text-light-accent dark:text-dark-accent hover:text-white transition-all duration-300 hover:scale-105 shadow-lg"
              aria-label="Twitter"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26l8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="#"
              className="w-12 h-12 bg-light-accent/10 dark:bg-dark-accent/10 hover:bg-light-accent dark:hover:bg-dark-accent rounded-xl flex items-center justify-center text-light-accent dark:text-dark-accent hover:text-white transition-all duration-300 hover:scale-105 shadow-lg"
              aria-label="Instagram"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07c3.252.148 4.771 1.691 4.919 4.919c.058 1.265.069 1.645.069 4.849c0 3.205-.012 3.584-.069 4.849c-.149 3.225-1.664 4.771-4.919 4.919c-1.266.058-1.644.07-4.85.07c-3.204 0-3.584-.012-4.849-.07c-3.26-.149-4.771-1.699-4.919-4.92c-.058-1.265-.07-1.644-.07-4.849c0-3.204.013-3.583.07-4.849c.149-3.227 1.664-4.771 4.919-4.919c1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072c-4.358.2-6.78 2.618-6.98 6.98c-.059 1.281-.073 1.689-.073 4.948c0 3.259.014 3.668.072 4.948c.2 4.358 2.618 6.78 6.98 6.98c1.281.058 1.689.072 4.948.072c3.259 0 3.668-.014 4.948-.072c4.354-.2 6.782-2.618 6.979-6.98c.059-1.28.073-1.689.073-4.948c0-3.259-.014-3.667-.072-4.947c-.196-4.354-2.617-6.78-6.979-6.98c-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162c0 3.403 2.759 6.163 6.162 6.163s6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4c0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Ссылки */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-auto text-center md:text-left items-start">
          <div className="flex flex-col">
            <h4 className="text-lg font-semibold text-light-fg dark:text-dark-fg mb-4">
              О нас
            </h4>
            <ul className="space-y-2 flex-1">
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  О компании
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  Вакансии
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  Новости
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  Блог
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="text-lg font-semibold text-light-fg dark:text-dark-fg mb-4">
              Продукты
            </h4>
            <ul className="space-y-2 flex-1">
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  Торговля
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  Инструменты
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  Портфолио
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  Аналитика
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="text-lg font-semibold text-light-fg dark:text-dark-fg mb-4">
              Для бизнеса
            </h4>
            <ul className="space-y-2 flex-1">
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  Партнёрство
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  API
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  VIP-услуги
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  Листинг
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="text-lg font-semibold text-light-fg dark:text-dark-fg mb-4">
              Обучение
            </h4>
            <ul className="space-y-2 flex-1">
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  Академия
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  Вебинары
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  Гайды
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="text-lg font-semibold text-light-fg dark:text-dark-fg mb-4">
              Поддержка
            </h4>
            <ul className="space-y-2 flex-1">
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  Помощь 24/7
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  Чат
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  Билеты
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-light-fg/70 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
                >
                  Статус
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Нижняя секция - прижата к низу */}
        <div className="border-t border-light-border/30 dark:border-dark-border/30 py-8 mt-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <div>
              <p className="text-light-fg/80 dark:text-dark-brown">
                Wolf Street © {new Date().getFullYear()} • Все права защищены
              </p>
            </div>

            <div className="flex gap-6 text-sm">
              <a
                href="#"
                className="text-light-fg/60 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
              >
                Условия использования
              </a>
              <a
                href="#"
                className="text-light-fg/60 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
              >
                Политика конфиденциальности
              </a>
              <a
                href="#"
                className="text-light-fg/60 dark:text-dark-brown hover:text-light-accent dark:hover:text-dark-accent transition-colors"
              >
                Настройки cookie
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
