import React, { useEffect, useState } from "react";
import { API_HOST } from "../../services/Api";
import { usePortfolioId } from "../../hooks/usePortfolioId";
import { useInstruments } from "../../hooks/useInstruments";

interface Trade {
  price: number;
  amount: number;
  side: "buy" | "sell";
  time: string;
}

const mockTrades: Trade[] = [
  { price: 118247.3, amount: 0.00253, side: "sell", time: "17:10:27" },
  { price: 118247.3, amount: 0.00423, side: "sell", time: "17:10:27" },
  { price: 118247.3, amount: 0.003, side: "sell", time: "17:10:27" },
  { price: 118247.3, amount: 0.005, side: "sell", time: "17:10:27" },
  { price: 118247.31, amount: 0.00422, side: "buy", time: "17:10:27" },
  { price: 118247.31, amount: 0.003, side: "buy", time: "17:10:27" },
  { price: 118247.31, amount: 0.0005, side: "buy", time: "17:10:27" },
  { price: 118247.31, amount: 0.01713, side: "buy", time: "17:10:27" },
  { price: 118247.69, amount: 0.00005, side: "sell", time: "17:10:27" },
  { price: 118247.79, amount: 0.00765, side: "sell", time: "17:10:27" },
  { price: 118247.99, amount: 0.00298, side: "sell", time: "17:10:27" },
  { price: 118248.05, amount: 0.00169, side: "sell", time: "17:10:27" },
  { price: 118248.0, amount: 0.00215, side: "sell", time: "17:10:27" },
  { price: 118248.06, amount: 0.00015, side: "sell", time: "17:10:27" },
  { price: 118248.86, amount: 0.00009, side: "sell", time: "17:10:27" },
  { price: 118249.0, amount: 0.001, side: "buy", time: "17:10:27" },
  { price: 118249.1, amount: 0.002, side: "buy", time: "17:10:27" },
  { price: 118249.2, amount: 0.003, side: "buy", time: "17:10:27" },
  { price: 118249.3, amount: 0.004, side: "buy", time: "17:10:27" },
  { price: 118249.4, amount: 0.005, side: "buy", time: "17:10:27" },
];

const ROW_HEIGHT = 20;
const VISIBLE_ROWS = 10;
const GRAPH_POINTS = 32;
const GRAPH_HEIGHT = ROW_HEIGHT * (VISIBLE_ROWS + 3); // график чуть выше

function genGraphData(prev: number[]): number[] {
  return prev.map((v, i) => {
    const delta = (Math.random() - 0.5) * 7; // амплитуда изменений увеличена
    let next = v + delta;
    if (i === 0) next = 50 + Math.random() * 20; // стартовая точка чуть более случайная
    if (next < 10) next = 10;
    if (next > 90) next = 90;
    return next;
  });
}

const TABS = [
  { key: "market", label: "Рынок" },
  { key: "user", label: "Мои" },
];

const TradesList: React.FC = () => {
  const [tab, setTab] = useState<"market" | "user">("market");
  const [marketTrades, setMarketTrades] = useState<Trade[]>(mockTrades);
  const [userTrades, setUserTrades] = useState<Trade[]>([]);
  const [loadingUser, setLoadingUser] = useState(false);
  const [errorUser, setErrorUser] = useState<string | null>(null);
  const [loadingMarket, setLoadingMarket] = useState(false);
  const [errorMarket, setErrorMarket] = useState<string | null>(null);
  const portfolioId = usePortfolioId();
  const { instruments } = useInstruments();
  // Выбираем первый доступный инструмент (или можно сделать через props)
  const instrumentId =
    instruments.length > 0 ? instruments[0].instrumentId : null;

  // График (оставляем как есть)
  const [graph, setGraph] = useState<number[]>(() =>
    Array.from(
      { length: GRAPH_POINTS },
      (_, i) => 50 + Math.sin(i / 3) * 20 + Math.random() * 5
    )
  );
  useEffect(() => {
    const interval = setInterval(() => {
      setGraph((prev) => genGraphData(prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Загрузка реальных рыночных сделок через REST
  useEffect(() => {
    if (tab !== "market" || !instrumentId) return;
    setLoadingMarket(true);
    setErrorMarket(null);
    fetch(
      `${API_HOST}/market-data-service/api/v1/trades/${instrumentId}?limit=${VISIBLE_ROWS}`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error("Ошибка загрузки рыночных сделок");
        return res.json();
      })
      .then((data) => {
        // Преобразуем в Trade[]
        const trades = Array.isArray(data)
          ? data.map((t: any) => ({
              price: t.price,
              amount: t.amount,
              side: (t.side?.toLowerCase() === "buy" ? "buy" : "sell") as
                | "buy"
                | "sell",
              time: new Date(
                t.timestamp || t.time || t.createdAt
              ).toLocaleTimeString("ru-RU", {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              }),
            }))
          : [];
        setMarketTrades(trades);
      })
      .catch((e) =>
        setErrorMarket(e.message || "Ошибка загрузки рыночных сделок")
      )
      .finally(() => setLoadingMarket(false));
  }, [tab, instrumentId]);

  // Загрузка завершённых ордеров пользователя
  useEffect(() => {
    if (tab !== "user" || !portfolioId) return;
    setLoadingUser(true);
    setErrorUser(null);
    fetch(
      `${API_HOST}/order-service/api/v1/order/closed?portfolioId=${portfolioId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }
    )
      .then(async (res) => {
        if (res.status === 401) throw new Error("Пользователь не авторизован!");
        if (res.status === 404) return [];
        if (!res.ok) throw new Error("Ошибка загрузки завершённых ордеров");
        return res.json();
      })
      .then((data) => {
        // Преобразуем в Trade[]
        const trades = Array.isArray(data)
          ? data
              .slice(-VISIBLE_ROWS)
              .reverse()
              .map((o: any) => ({
                price: o.lotPrice,
                amount: o.count,
                side: (o.side?.toLowerCase() === "buy" ? "buy" : "sell") as
                  | "buy"
                  | "sell",
                time: new Date(
                  o.closedAt || o.updatedAt || o.createdAt
                ).toLocaleTimeString("ru-RU", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
              }))
          : [];
        setUserTrades(trades);
      })
      .catch((e) =>
        setErrorUser(e.message || "Ошибка загрузки завершённых ордеров")
      )
      .finally(() => setLoadingUser(false));
  }, [tab, portfolioId]);

  const width = 320;
  const height = GRAPH_HEIGHT;
  const step = width / (GRAPH_POINTS - 1);
  const graphWithEdges = [
    height,
    ...graph.slice(1, -1).map((y) => height - (y / 100) * height),
    height,
  ];
  const path = graphWithEdges
    .map((y, i) => `${i === 0 ? "M" : "L"}${i * step},${y}`)
    .join(" ");
  const area = `${path} L${width},${height} L0,${height} Z`;

  // Выбор данных для текущей вкладки
  const data =
    tab === "market"
      ? marketTrades.slice(0, VISIBLE_ROWS)
      : userTrades.slice(0, VISIBLE_ROWS);

  return (
    <div className="relative w-full h-[450px] bg-white/30 dark:bg-dark-card/40 backdrop-blur-md border border-light-border/40 dark:border-dark-border/40 rounded-2xl shadow-2xl animate-fadein flex flex-col">
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
      </div>
      {/* Заголовки */}
      <div className="grid grid-cols-3 gap-0 px-4 py-1 text-xs font-semibold text-light-fg-secondary dark:text-dark-brown border-b border-light-border/30 dark:border-dark-border/30 select-none tracking-tight bg-light-bg/60 dark:bg-dark-bg/60">
        <span className="text-left">Цена (USDT)</span>
        <span className="text-center">Кол-во (BTC)</span>
        <span className="text-right">Время</span>
      </div>
      {/* Список сделок */}
      <div
        className="divide-y divide-light-border/20 dark:divide-dark-border/20"
        style={{
          height: `${ROW_HEIGHT * VISIBLE_ROWS}px`,
          overflowY: "hidden",
        }}
      >
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
              key={i}
              style={{ height: `${ROW_HEIGHT}px` }}
              className="grid grid-cols-3 gap-0 px-4 py-0 text-xs leading-[1.1] items-center cursor-pointer tracking-tight"
            >
              <span
                className={`text-left font-bold ${
                  t.side === "buy"
                    ? "text-light-success dark:text-dark-accent"
                    : "text-red-500 dark:text-red-400"
                }`}
              >
                {t.price?.toLocaleString("ru-RU", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-center text-light-fg dark:text-dark-fg font-mono">
                {t.amount}
              </span>
              <span className="text-right text-light-fg-secondary dark:text-dark-brown font-mono">
                {t.time}
              </span>
            </div>
          ))
        )}
      </div>
      {/* SVG график под таблицей */}
      <svg
        className="w-full z-0 pointer-events-none select-none text-light-accent/20 dark:text-dark-accent/20"
        style={{ display: "block", marginTop: 0 }}
        width={width}
        height={height + 40}
      >
        <defs>
          <linearGradient id="trades-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.08" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#trades-bg)" />
        <path
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          opacity="0.35"
        />
      </svg>
    </div>
  );
};

export default TradesList;
