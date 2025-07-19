import { useTypedEffect } from "../../../hooks/useTypedEffect";
import { useState, useEffect } from "react";
import { FaChartLine, FaUsers, FaExchangeAlt, FaGlobe } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../../../services/auth/Login";

interface HeroSectionProps {
  heroVisible: boolean;
  setEmail: (e: string) => void;
  email: string;
}

export default function HeroSection({ heroVisible }: HeroSectionProps) {
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState("");
  const [platformStats, setPlatformStats] = useState({
    tradingVolume: 2400000,
    activeTraders: 15247,
    todayTrades: 1247,
    totalUsers: 25600,
  });

  // Функция для обработки клика на кнопку "Начать"
  const handleStartClick = () => {
    if (isAuthenticated()) {
      // Если пользователь авторизован, перенаправляем на страницу торговли
      navigate("/trade");
    } else {
      // Если не авторизован, перенаправляем на страницу входа
      navigate("/login");
    }
  };

  // Функция для получения приветствия по времени суток
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours();

    if (hour >= 4 && hour <= 11) {
      return "Доброе утро! Готовы к торговле?";
    } else if (hour >= 12 && hour <= 17) {
      return "Добрый день! Готовы к торговле?";
    } else if (hour >= 18 && hour <= 21) {
      return "Добрый вечер! Готовы к торговле?";
    } else {
      return "Доброй ночи! Готовы к торговле?";
    }
  };

  // Функция для получения реальных данных с API
  const fetchRealStats = async () => {
    const baseStats = {
      tradingVolume: 2400000,
      activeTraders: 15247,
      todayTrades: 1247,
      totalUsers: 25600,
    };

    try {
      // Получаем объем торгов
      const volumeResponse = await fetch(
        "http://wolf-street.ru/analytic-service/api/v1/total-volume?period=1d"
      );
      let tradingVolume = baseStats.tradingVolume;
      if (volumeResponse.ok) {
        const volumeData = await volumeResponse.json();
        // Преобразуем к числу, если API возвращает строку
        tradingVolume =
          typeof volumeData === "number"
            ? volumeData
            : parseFloat(volumeData) || baseStats.tradingVolume;
      }

      // Получаем количество сделок
      const dealsResponse = await fetch(
        "http://wolf-street.ru/analytic-service/api/v1/total-deals?period=1d"
      );
      let todayTrades = baseStats.todayTrades;
      if (dealsResponse.ok) {
        const dealsData = await dealsResponse.json();
        // Преобразуем к числу, если API возвращает строку
        todayTrades =
          typeof dealsData === "number"
            ? dealsData
            : parseFloat(dealsData) || baseStats.todayTrades;
      }

      // Для активных трейдеров и всего пользователей используем mock данные с небольшими вариациями
      const tradersVariation = 0.98 + Math.random() * 0.04; // ±2%
      const usersVariation = 1.001 + Math.random() * 0.002; // Медленный рост

      return {
        tradingVolume: Math.floor(tradingVolume),
        activeTraders: Math.floor(baseStats.activeTraders * tradersVariation),
        todayTrades: Math.floor(todayTrades),
        totalUsers: Math.floor(baseStats.totalUsers * usersVariation),
      };
    } catch (error) {
      console.warn(
        "Ошибка получения статистики, используем mock данные:",
        error
      );
      // Fallback к mock данным при ошибке
      return generateMockStats();
    }
  };

  // Генерация mock данных для fallback (оставляем как запасной вариант)
  const generateMockStats = () => {
    const baseVolume = 2400000;
    const baseTraders = 15247;
    const baseTrades = 1247;
    const baseUsers = 25600;

    // Добавляем небольшие реалистичные колебания
    const volumeVariation = 0.95 + Math.random() * 0.1; // ±5%
    const tradersVariation = 0.98 + Math.random() * 0.04; // ±2%
    const tradesVariation = 0.9 + Math.random() * 0.2; // ±10%
    const usersVariation = 1.001 + Math.random() * 0.002; // Медленный рост

    return {
      tradingVolume: Math.floor(baseVolume * volumeVariation),
      activeTraders: Math.floor(baseTraders * tradersVariation),
      todayTrades: Math.floor(baseTrades * tradesVariation),
      totalUsers: Math.floor(baseUsers * usersVariation),
    };
  };

  // Форматирование чисел для отображения
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `₽${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `₽${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  const formatUserNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(0)}K`;
    }
    return num.toString();
  };

  // Устанавливаем приветствие и обновляем статистику
  useEffect(() => {
    const updateGreeting = () => {
      setGreeting(getTimeBasedGreeting());
    };

    const updateStats = async () => {
      const newStats = await fetchRealStats();
      setPlatformStats(newStats);
    };

    // Устанавливаем сразу
    updateGreeting();
    updateStats();

    // Обновляем приветствие каждую минуту
    const greetingInterval = setInterval(updateGreeting, 60000);

    // Обновляем статистику каждые 30 секунд для "живости"
    const statsInterval = setInterval(updateStats, 30000);

    return () => {
      clearInterval(greetingInterval);
      clearInterval(statsInterval);
    };
  }, []);

  // Эффект печатания для заголовка
  const { displayText } = useTypedEffect({
    texts: [
      "Биржа будущего",
      "Торгуйте с Wolf Street",
      "Инвестируйте умно",
      "Ваш путь к успеху",
    ],
    typeSpeed: 80,
    backSpeed: 40,
    startDelay: 800,
    backDelay: 2500,
    loop: true,
    showCursor: false,
  });

  return (
    <>
      <section
        id="main"
        className="snap-start relative flex flex-col items-center justify-center min-h-screen h-screen p-0 border-b border-light-border dark:border-dark-border w-full m-0 bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg overflow-hidden"
      >
        {/* Анимированный градиентный фон */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Волна 1 - основная */}
          <div className="absolute left-1/2 top-1/2 w-[650px] h-[650px] animate-gradient-wave-1">
            <div className="w-full h-full bg-gradient-to-br from-light-accent/25 via-purple-500/18 to-pink-500/25 dark:from-dark-accent/30 dark:via-emerald-400/22 dark:to-teal-400/28 rounded-full blur-3xl"></div>
          </div>

          {/* Волна 2 - вторичная */}
          <div className="absolute left-1/3 top-1/3 w-[450px] h-[450px] animate-gradient-wave-2">
            <div className="w-full h-full bg-gradient-to-tr from-blue-500/22 via-light-accent/25 to-indigo-500/22 dark:from-blue-400/25 dark:via-dark-accent/30 dark:to-cyan-400/25 rounded-full blur-3xl"></div>
          </div>

          {/* Волна 3 - акцентная */}
          <div className="absolute right-1/3 bottom-1/3 w-[550px] h-[550px] animate-gradient-wave-3">
            <div className="w-full h-full bg-gradient-to-bl from-orange-400/18 via-yellow-500/22 to-light-accent/25 dark:from-green-400/22 dark:via-dark-accent/28 dark:to-emerald-500/22 rounded-full blur-3xl"></div>
          </div>

          {/* Дополнительная подложка для глубины */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-light-bg/15 to-light-bg/25 dark:via-dark-bg/15 dark:to-dark-bg/25"></div>
        </div>

        <div
          className={`w-full h-full flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-24 z-10 px-4 lg:px-0 transition-all duration-700 ease-out
            ${
              heroVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-10"
            }`}
        >
          {/* Левая часть: заголовок, описание, популярные инструменты */}
          <div className="flex flex-col items-start justify-center w-full max-w-md lg:max-w-[460px] text-center lg:text-left">
            {/* Персонализированное приветствие */}
            <div className="mb-3 lg:mb-4">
              <p className="text-sm sm:text-base lg:text-lg text-light-accent dark:text-dark-accent font-medium opacity-90 animate-fade-in">
                {greeting}
              </p>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[42px] font-extrabold text-light-fg dark:text-dark-fg mb-4 lg:mb-6 leading-tight tracking-tight min-h-[1.2em]">
              <span className="text-light-accent dark:text-dark-accent">
                {displayText}
              </span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-light-accent dark:text-dark-accent font-medium mb-6 lg:mb-8 max-w-full lg:max-w-[420px] leading-relaxed">
              Управляйте капиталом, инвестируйте и следите за рынком в
              премиальном стиле. Wolf Street — ваш финансовый успех начинается
              здесь.
            </p>

            {/* Минималистичный баннер с фоном как у статистики */}
            <div className="w-full mb-4 lg:mb-6">
              <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-lg border border-light-accent dark:border-dark-accent">
                <div className="p-6 text-center">
                  {/* Основной текст */}
                  <p className="text-light-fg/70 dark:text-dark-fg/70 mb-5 text-lg max-w-md mx-auto">
                    {formatUserNumber(platformStats.activeTraders)} трейдеров
                    уже выбрали нас. Присоединяйтесь к успешному сообществу.
                  </p>

                  {/* Широкая кнопка по центру */}
                  <div className="flex flex-col items-center">
                    <button
                      onClick={handleStartClick}
                      className="py-2.5 px-24 bg-light-accent dark:bg-dark-accent text-white rounded-xl font-semibold text-lg hover:opacity-90 hover:scale-105 transition-all shadow-lg"
                    >
                      Начать
                    </button>
                    <p className="text-xs text-light-fg/50 dark:text-dark-fg/50 mt-2">
                      {isAuthenticated()
                        ? "Перейти к торговле"
                        : "Войти или создать аккаунт"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Правая часть: статистика платформы */}
          <div className="flex flex-col items-center justify-center w-full max-w-[380px] lg:max-w-[420px] mt-4 lg:mt-0">
            <div className="bg-light-card dark:bg-dark-card rounded-lg shadow-lg p-6 w-full border border-light-accent dark:border-dark-accent">
              <h3 className="text-lg font-semibold mb-6 text-light-accent dark:text-dark-accent text-center">
                Статистика платформы
              </h3>
              <div className="space-y-4">
                {/* Объем торгов */}
                <div className="flex items-center gap-4 p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <FaChartLine className="text-green-500 text-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-light-fg/70 dark:text-dark-fg/70 mb-1">
                      Объем торгов 24ч
                    </div>
                    <div className="font-bold text-green-500 text-lg">
                      {formatNumber(platformStats.tradingVolume)}
                    </div>
                  </div>
                </div>

                {/* Активные трейдеры */}
                <div className="flex items-center gap-4 p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <FaUsers className="text-blue-500 text-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-light-fg/70 dark:text-dark-fg/70 mb-1">
                      Активных трейдеров
                    </div>
                    <div className="font-bold text-blue-500 text-lg">
                      {formatUserNumber(platformStats.activeTraders)}
                    </div>
                  </div>
                </div>

                {/* Сделки за сегодня */}
                <div className="flex items-center gap-4 p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                    <FaExchangeAlt className="text-orange-500 text-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-light-fg/70 dark:text-dark-fg/70 mb-1">
                      Сделок сегодня
                    </div>
                    <div className="font-bold text-orange-500 text-lg">
                      {formatUserNumber(platformStats.todayTrades)}
                    </div>
                  </div>
                </div>

                {/* Всего пользователей */}
                <div className="flex items-center gap-4 p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                    <FaGlobe className="text-indigo-500 text-lg" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-light-fg/70 dark:text-dark-fg/70 mb-1">
                      Всего пользователей
                    </div>
                    <div className="font-bold text-indigo-500 text-lg">
                      {formatUserNumber(platformStats.totalUsers)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
