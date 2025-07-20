import React, { useEffect, useState } from "react";
// import { API_HOST } from "../../services/Api";
// import { usePortfolioId } from "../../hooks/usePortfolioId";
import { useInstruments } from "../../hooks/useInstruments";
import { useMarketDeals } from "../../hooks/useMarketDeals";

interface Trade {
  price: number;
  amount: number;
  side: "buy" | "sell";
  time: string;
}

const ROW_HEIGHT = 20;
const VISIBLE_ROWS = 21;

const TABS = [
  { key: "market", label: "Рынок" },
  { key: "user", label: "Мои" },
];

interface TradesListProps {
  instrumentId?: number;
}

const TradesList: React.FC<TradesListProps> = ({
  instrumentId: propInstrumentId,
}) => {
  const [tab, setTab] = useState<"market" | "user">("market");
  const [userTrades, setUserTrades] = useState<Trade[]>([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const [errorUser, setErrorUser] = useState<string | null>(null);
  // const portfolioId = usePortfolioId();
  const { instruments } = useInstruments();
  // Используем переданный instrumentId или первый доступный инструмент
  const instrumentId =
    propInstrumentId ||
    (instruments.length > 0 ? instruments[0].instrumentId : null);

  // Используем новый хук для рыночных сделок
  const {
    trades: marketTrades,
    loading: loadingMarket,
    error: errorMarket,
  } = useMarketDeals(instrumentId);

  // Обновляем время каждую секунду для более динамичного отображения
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const USER_HISTORY_URL = "http://wolf-street.ru/portfolio-service/api/v1/portfolio/history";

  // Загрузка истории сделок пользователя через новую ручку с polling
  useEffect(() => {
    let interval: number | null = null;
    let stopped = false;
    async function fetchUserHistory() {
      setLoadingUser(true);
      setErrorUser(null);
      try {
        // Диапазон: последние 7 дней
        const now = Date.now();
        const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
        const url = `${USER_HISTORY_URL}?from=${weekAgo}&to=${now}`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        if (res.status === 401) throw new Error("Пользователь не авторизован!");
        if (res.status === 404) {
          setUserTrades([]);
          setLoadingUser(false);
          return;
        }
        if (!res.ok) throw new Error("Ошибка загрузки истории сделок");
        const data = await res.json();
        // Оставляем только торговые сделки (есть instrumentId и тип BUY/SALE)
        const trades = Array.isArray(data)
          ? data
              .filter((item: any) => item.instrumentId && ["BUY", "SALE"].includes(item.dealType))
              .slice(-VISIBLE_ROWS)
              .reverse()
              .map((item: any) => ({
                price: item.lotPrice,
                amount: item.count,
                side: (item.dealType === "BUY" ? "buy" : "sell") as "buy" | "sell",
                time: new Date(item.completedAt).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
              }))
          : [];
        setUserTrades(trades);
      } catch (e: any) {
        setErrorUser(e.message || "Ошибка загрузки истории сделок");
        setUserTrades([]);
      } finally {
        setLoadingUser(false);
      }
    }
    if (tab === "user") {
      fetchUserHistory();
      interval = window.setInterval(() => {
        if (!stopped) fetchUserHistory();
      }, 5000);
    }
    return () => {
      stopped = true;
      if (interval) clearInterval(interval);
    };
  }, [tab]);

  // Выбор данных для текущей вкладки
  const data =
    tab === "market"
      ? marketTrades.slice(0, 21)
      : userTrades.slice(0, VISIBLE_ROWS);

  // Функция для определения цвета цены на основе изменения
  const getPriceColor = (
    currentPrice: number,
    index: number,
    trades: Trade[]
  ) => {
    if (index === 0) return "text-light-fg dark:text-dark-fg"; // Первая сделка - нейтральный цвет

    const previousPrice = trades[index - 1]?.price;
    if (!previousPrice) return "text-light-fg dark:text-dark-fg";

    if (currentPrice > previousPrice) {
      return "text-green-600 dark:text-green-400"; // Цена выросла - зеленый
    } else if (currentPrice < previousPrice) {
      return "text-red-500 dark:text-red-400"; // Цена упала - красный
    } else {
      return "text-light-fg dark:text-dark-fg"; // Цена не изменилась - нейтральный
    }
  };

  // Функция для получения индикатора направления цены
  const getPriceIndicator = (
    currentPrice: number,
    index: number,
    trades: Trade[]
  ) => {
    if (index === 0) return ""; // Первая сделка - без индикатора

    const previousPrice = trades[index - 1]?.price;
    if (!previousPrice) return "";

    if (currentPrice > previousPrice) {
      return "↑"; // Стрелка вверх
    } else if (currentPrice < previousPrice) {
      return "↓"; // Стрелка вниз
    } else {
      return ""; // Без стрелки
    }
  };

  return (
    <div className="relative w-full h-full bg-white/30 dark:bg-dark-card/40 backdrop-blur-md border border-light-border/40 dark:border-dark-border/40 rounded-2xl shadow-2xl animate-fadein flex flex-col">
      {/* Вкладки */}
      <div className="flex items-center px-4 pt-2 pb-1 border-b border-light-border/40 dark:border-dark-border/40 bg-light-bg/80 dark:bg-dark-bg/80 rounded-t-2xl gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`text-xs font-bold tracking-tight px-2 py-1 rounded
              ${
                tab === t.key
                  ? "bg-light-accent/20 dark:bg-dark-accent/20 text-light-accent dark:text-dark-accent"
                  : "text-light-fg-secondary dark:text-dark-brown"
              }`}
            onClick={() => setTab(t.key as "market" | "user")}
          >
            {t.label}
          </button>
        ))}
        <span className="flex-1" />
        {/* Индикатор WebSocket подключения для рыночных сделок */}
        {tab === "market" && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <div
                className={`w-2 h-2 rounded-full ${
                  loadingMarket
                    ? "bg-yellow-500 animate-pulse"
                    : errorMarket
                    ? "bg-red-500"
                    : "bg-green-500"
                }`}
              />
              <span className="text-xs text-light-fg-secondary dark:text-dark-brown">
                {loadingMarket
                  ? "Подключение..."
                  : errorMarket
                  ? "Ошибка"
                  : "Live"}
              </span>
            </div>
            <span className="text-xs text-light-fg-secondary dark:text-dark-brown">
              {data.length} сделок
            </span>
          </div>
        )}
      </div>
      {/* Заголовки */}
      <div className="grid grid-cols-3 gap-0 px-4 py-1 text-xs font-semibold text-light-fg-secondary dark:text-dark-brown border-b border-light-border/30 dark:border-dark-border/30 select-none tracking-tight bg-light-bg/60 dark:bg-dark-bg/60">
        <span className="text-left">Цена (RUB)</span>
        <span className="text-center">Кол-во</span>
        <span className="text-right">Время</span>
      </div>
      {/* Список сделок */}
      <div className="divide-y divide-light-border/20 dark:divide-dark-border/20 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-light-accent dark:scrollbar-thumb-dark-accent scrollbar-track-transparent">
        {tab === "market" && loadingMarket ? (
          <div className="flex items-center justify-center h-full text-xs text-light-fg-secondary dark:text-dark-brown">
            Загрузка...
          </div>
        ) : tab === "market" && errorMarket ? (
          <div className="flex items-center justify-center h-full text-xs text-red-500 dark:text-red-400">
            {errorMarket}
          </div>
        ) : tab === "user" && loadingUser ? (
          <div className="flex items-center justify-center h-full text-xs text-light-fg-secondary dark:text-dark-brown">
            Загрузка...
          </div>
        ) : tab === "user" && errorUser ? (
          <div className="flex items-center justify-center h-full text-xs text-red-500 dark:text-red-400">
            {errorUser}
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-light-fg-secondary dark:text-dark-brown">
            Нет данных
          </div>
        ) : (
          data.map((t, i) => (
            <div
              key={`${t.time}-${t.price}-${t.amount}-${i}`}
              style={{ height: `${ROW_HEIGHT}px` }}
              className={`grid grid-cols-3 gap-0 px-4 py-0 text-xs leading-[1.1] items-center cursor-pointer tracking-tight transition-all duration-500 ${
                i === 0 && tab === "market"
                  ? "bg-green-50 dark:bg-green-900/20 animate-pulse"
                  : ""
              }`}
            >
              <span
                className={`text-left font-bold ${getPriceColor(
                  t.price,
                  i,
                  data
                )}`}
              >
                {t.price?.toLocaleString("ru-RU", { minimumFractionDigits: 2 })}
                <span className="ml-1 text-xs">
                  {getPriceIndicator(t.price, i, data)}
                </span>
              </span>
              <span className="text-center text-light-fg dark:text-dark-fg font-mono">
                {t.amount}
              </span>
              <span className="text-right text-light-fg-secondary dark:text-dark-brown font-mono">
                {i === 0 && tab === "market"
                  ? currentTime.toLocaleTimeString("ru-RU", {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : t.time}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TradesList;
