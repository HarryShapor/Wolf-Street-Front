import { useTheme } from "../../context/ThemeContext";
import { FaDiscord, FaTelegram, FaYoutube, FaInstagram } from "react-icons/fa";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <section
      id="footer"
      className="snap-start min-h-screen w-full bg-light-card dark:bg-dark-card relative flex flex-col overflow-hidden"
    >
      {/* Упрощенный декоративный фон без полосок */}
      <div className="absolute inset-0 bg-gradient-to-br from-light-card via-light-bg to-light-card dark:from-dark-card dark:via-dark-bg dark:to-dark-card"></div>

      {/* Основной контент футера */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-8 pt-32 flex-1 flex flex-col">
        {/* Главная секция с логотипом без свечения */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-6">
            <span className="text-[32px] relative inline-block w-12 h-12">
              {/* Светлый логотип */}
              <img
                src="/image/wolf_logo.svg"
                alt="Wolf Street"
                className={`w-12 h-12 absolute top-0 left-0 z-10 object-contain object-center transition-opacity duration-300 ease-in-out ${
                  theme === "light" ? "opacity-100" : "opacity-0"
                }`}
              />
              {/* Темный логотип */}
              <img
                src="/image/wolf_logo_for_black.png"
                alt="Wolf Street"
                className={`w-12 h-12 absolute top-0 left-0 z-10 object-contain object-center transition-opacity duration-300 ease-in-out ${
                  theme === "dark" ? "opacity-100" : "opacity-0"
                }`}
              />
            </span>

            <h2 className="text-3xl font-bold bg-gradient-to-r from-light-accent to-blue-600 dark:from-dark-accent dark:to-emerald-400 bg-clip-text text-transparent">
              Wolf Street
            </h2>
          </div>
          <p className="text-lg text-light-fg/70 dark:text-dark-brown max-w-xl mx-auto leading-relaxed">
            Премиальная торговая платформа для управления капиталом и
            инвестирования
          </p>
        </div>

        {/* Улучшенные социальные сети с более мягкими hover эффектами */}
        <div className="text-center mb-20">
          <h3 className="text-xl font-semibold text-light-fg dark:text-dark-fg mb-8">
            Присоединяйтесь к сообществу
          </h3>
          <div className="flex gap-4 justify-center">
            <a
              href="#"
              className="group w-12 h-12 bg-light-accent/10 dark:bg-dark-accent/10 hover:bg-light-accent/20 dark:hover:bg-dark-accent/20 rounded-xl flex items-center justify-center text-light-accent dark:text-dark-accent hover:text-light-accent dark:hover:text-dark-accent transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-light-accent/20 dark:border-dark-accent/20 hover:border-light-accent/40 dark:hover:border-dark-accent/40"
              aria-label="Discord"
            >
              <FaDiscord className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
            </a>

            <a
              href="#"
              className="group w-12 h-12 bg-light-accent/10 dark:bg-dark-accent/10 hover:bg-light-accent/20 dark:hover:bg-dark-accent/20 rounded-xl flex items-center justify-center text-light-accent dark:text-dark-accent hover:text-light-accent dark:hover:text-dark-accent transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-light-accent/20 dark:border-dark-accent/20 hover:border-light-accent/40 dark:hover:border-dark-accent/40"
              aria-label="Telegram"
            >
              <FaTelegram className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
            </a>

            <a
              href="#"
              className="group w-12 h-12 bg-light-accent/10 dark:bg-dark-accent/10 hover:bg-light-accent/20 dark:hover:bg-dark-accent/20 rounded-xl flex items-center justify-center text-light-accent dark:text-dark-accent hover:text-light-accent dark:hover:text-dark-accent transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-light-accent/20 dark:border-dark-accent/20 hover:border-light-accent/40 dark:hover:border-dark-accent/40"
              aria-label="YouTube"
            >
              <FaYoutube className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
            </a>

            <a
              href="#"
              className="group w-12 h-12 bg-light-accent/10 dark:bg-dark-accent/10 hover:bg-light-accent/20 dark:hover:bg-dark-accent/20 rounded-xl flex items-center justify-center text-light-accent dark:text-dark-accent hover:text-light-accent dark:hover:text-dark-accent transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border border-light-accent/20 dark:border-dark-accent/20 hover:border-light-accent/40 dark:hover:border-dark-accent/40"
              aria-label="Instagram"
            >
              <FaInstagram className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
            </a>
          </div>
        </div>

        {/* Ссылки */}
        {/* Исправленный layout с flex вместо grid */}
        <div className="mb-auto">
          <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 max-w-5xl mx-auto">
            <div className="flex flex-col min-w-[160px] text-center md:text-left">
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

            <div className="flex flex-col min-w-[160px] text-center md:text-left">
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

            <div className="flex flex-col min-w-[160px] text-center md:text-left">
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

            <div className="flex flex-col min-w-[160px] text-center md:text-left">
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

            <div className="flex flex-col min-w-[160px] text-center md:text-left">
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
