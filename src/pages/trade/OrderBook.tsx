import React, { useRef, useEffect, useState, useMemo } from "react";
import Card from "../../components/ui/Card";
import { useOrderbookSpread } from "../../hooks/useOrderbookSpread";

interface OrderBookProps {
  price: number;
  orderBookSell: { price: number; amount: number }[];
  orderBookBuy: { price: number; amount: number }[];
  loadingOrderBook: boolean;
  errorOrderBook: string | null;
  instrumentId: number;
}

// 1. Увеличиваем высоту стакана (например, до 600px)
// (Это делается в родительском компоненте, но можно подсказать, что высота должна быть больше)
// Для наглядности, увеличим ROW_HEIGHT и visibleRows
const ROW_HEIGHT = 28; // px, подбери под свой дизайн

export default function OrderBook({
  price,
  orderBookSell,
  orderBookBuy,
  loadingOrderBook,
  errorOrderBook,
  instrumentId,
}: OrderBookProps) {
  if (!instrumentId || isNaN(Number(instrumentId)) || instrumentId === 0) {
    return (
      <div className="flex items-center justify-center h-full text-light-fg-secondary dark:text-dark-brown text-sm">
        Выберите инструмент для отображения стакана
      </div>
    );
  }
  // Безопасная деструктуризация spread-данных
  const spreadData = useOrderbookSpread(instrumentId) || {};
  const {
    midPrice = null,
    bestBid = null,
    bestAsk = null,
    spread = null,
    loading: spreadLoading,
    error: spreadError,
  } = spreadData;
  // Лог только spread-данных
  console.log("[OrderBook] spreadData:", spreadData);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRows, setVisibleRows] = useState(10);

  useEffect(() => {
    function updateRows() {
      if (!containerRef.current) return;
      const height = containerRef.current.offsetHeight;
      setVisibleRows(Math.max(2, Math.floor(height / ROW_HEIGHT)));
    }
    updateRows();
    window.addEventListener("resize", updateRows);
    return () => window.removeEventListener("resize", updateRows);
  }, []);

  // Показываем стакан: сверху flex-1 asks, по центру spread, снизу flex-1 bids
  const asks = [...orderBookSell].reverse();
  const bids = orderBookBuy;

  // Для визуализации: ищем максимальный объём среди всех заявок
  const maxAskVolume = Math.max(...asks.map((o) => o.price * o.amount), 1);
  const maxBidVolume = Math.max(...bids.map((o) => o.price * o.amount), 1);

  // --- Визуальное выделение изменившихся строк ---
  const [changedAsks, setChangedAsks] = useState<number[]>([]);
  const [changedBids, setChangedBids] = useState<number[]>([]);
  const prevAsksRef = useRef<typeof orderBookSell>([]);
  const prevBidsRef = useRef<typeof orderBookBuy>([]);

  // Используем useMemo для оптимизации сравнения
  const asksChanges = useMemo(() => {
    const changed: number[] = [];
    orderBookSell.forEach((o, i) => {
      const prev = prevAsksRef.current[i];
      if (!prev || prev.price !== o.price || prev.amount !== o.amount) {
        changed.push(i);
      }
    });
    prevAsksRef.current = orderBookSell;
    return changed;
  }, [orderBookSell]);

  const bidsChanges = useMemo(() => {
    const changed: number[] = [];
    orderBookBuy.forEach((o, i) => {
      const prev = prevBidsRef.current[i];
      if (!prev || prev.price !== o.price || prev.amount !== o.amount) {
        changed.push(i);
      }
    });
    prevBidsRef.current = orderBookBuy;
    return changed;
  }, [orderBookBuy]);

  // Используем useEffect только для установки изменений с debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setChangedAsks(asksChanges);
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [asksChanges]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setChangedBids(bidsChanges);
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [bidsChanges]);

  // Для анимации/цвета spread
  const [prevSpread, setPrevSpread] = useState<number | null>(null);
  const [spreadColor, setSpreadColor] = useState<string>(
    "text-light-fg dark:text-dark-fg"
  );
  useEffect(() => {
    if (typeof spread === "number" && !isNaN(spread)) {
      if (prevSpread !== null) {
        if (spread > prevSpread)
          setSpreadColor("text-green-600 dark:text-green-400");
        else if (spread < prevSpread)
          setSpreadColor("text-red-500 dark:text-red-400");
        else setSpreadColor("text-light-fg dark:text-dark-fg");
      }
      setPrevSpread(spread);
    }
  }, [spread]);

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full max-w-[280px] w-full overflow-hidden rounded-2xl group border border-light-border/10 dark:border-dark-border/10 shadow-2xl bg-white/30 dark:bg-dark-card/40 backdrop-blur-md animate-fadein mt-1"
    >
      <Card
        className="p-4 flex flex-col bg-transparent rounded-2xl h-full"
        disableHover={true}
      >
        <div className="relative z-10">
          <div className="flex flex-col gap-0 mb-0">
            <h3 className="font-extrabold text-light-fg dark:text-dark-fg text-base tracking-wide text-center flex-1 mb-0 mt-0 leading-tight">
              Биржевой стакан
            </h3>
            <div className="grid grid-cols-3 gap-0 px-2 pb-0 pt-0 select-none mt-0">
              <span className="text-right font-medium text-light-fg/80 dark:text-dark-fg/80 text-[10px]">
                Цена
              </span>
              <span className="text-right font-medium text-light-fg/80 dark:text-dark-fg/80 text-[10px]">
                Кол-во
              </span>
              <span className="text-right font-medium text-light-fg/80 dark:text-dark-fg/80 text-[10px]">
                Сумма
              </span>
            </div>
          </div>
          <div className="flex flex-col h-72 w-full text-xs font-mono">
            {/* Заголовки */}
            {/* ASK (sell) — сверху */}
            <div className="flex-1 flex flex-col-reverse gap-0.5 relative">
              {asks.map((o, i) => (
                <div
                  key={i}
                  className={`relative grid grid-cols-3 gap-0 items-center group min-h-[20px] rounded-lg overflow-hidden transition-colors duration-300 px-2 ${
                    changedAsks.includes(i)
                      ? "bg-pink-100 dark:bg-pink-900/30"
                      : ""
                  }`}
                >
                  {/* Bar визуализации */}
                  <div
                    className="absolute left-0 top-0 h-full z-0 rounded-lg"
                    style={{
                      width: `${Math.max(
                        8,
                        ((o.price * o.amount) / maxAskVolume) * 100
                      )}%`,
                      background:
                        "linear-gradient(90deg, rgba(255,92,138,0.18) 0%, rgba(255,92,138,0.32) 100%)",
                    }}
                  />
                  <span className="text-right font-bold text-light-error dark:text-error z-10 relative">
                    {o.price}
                  </span>
                  <span className="text-right text-light-fg dark:text-dark-fg z-10 relative">
                    {Number(o.amount).toLocaleString("ru-RU", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-right text-light-fg dark:text-dark-fg z-10 relative">
                    {Number(o.price * o.amount).toLocaleString("ru-RU", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
            {/* SPREAD (mid price) — по центру */}
            <div className="grid grid-cols-3 gap-0 px-2 py-1 min-h-[28px] bg-light-bg/80 dark:bg-dark-bg/80 rounded font-extrabold text-[16px] border-y border-light-border/30 dark:border-dark-border/30 my-1">
              <span
                className={`text-right font-bold transition-colors duration-300 ${spreadColor}`}
              >
                {typeof midPrice === "number" && !isNaN(midPrice)
                  ? midPrice.toLocaleString("ru-RU", {
                      maximumFractionDigits: 2,
                    })
                  : "—"}
              </span>
              <span className="text-center text-xs font-bold text-light-fg/70 dark:text-dark-fg/70">
                {typeof spread === "number" && !isNaN(spread)
                  ? spread.toLocaleString("ru-RU", { maximumFractionDigits: 2 })
                  : ""}
              </span>
              <span className="text-right text-xs text-light-fg/70 dark:text-dark-fg/70">
                {typeof bestBid === "number" && !isNaN(bestBid) && (
                  <span className="text-green-600 dark:text-green-400 font-semibold block">
                    bid:{" "}
                    {bestBid.toLocaleString("ru-RU", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                )}
                {typeof bestAsk === "number" && !isNaN(bestAsk) && (
                  <span className="text-red-500 dark:text-red-400 font-semibold block">
                    ask:{" "}
                    {bestAsk.toLocaleString("ru-RU", {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                )}
              </span>
            </div>
            {/* BID (buy) — снизу */}
            <div className="flex-1 flex flex-col gap-0.5 relative">
              {bids.map((o, i) => (
                <div
                  key={i}
                  className={`relative grid grid-cols-3 gap-0 items-center group min-h-[20px] rounded-lg overflow-hidden transition-colors duration-300 px-2 ${
                    changedBids.includes(i)
                      ? "bg-green-100 dark:bg-green-900/30"
                      : ""
                  }`}
                >
                  {/* Bar визуализации */}
                  <div
                    className="absolute left-0 top-0 h-full z-0 rounded-lg"
                    style={{
                      width: `${Math.max(
                        8,
                        ((o.price * o.amount) / maxBidVolume) * 100
                      )}%`,
                      background:
                        "linear-gradient(90deg, rgba(62,207,142,0.18) 0%, rgba(62,207,142,0.32) 100%)",
                    }}
                  />
                  <span className="text-right font-bold text-light-success dark:text-dark-accent z-10 relative">
                    {o.price}
                  </span>
                  <span className="text-right text-light-fg dark:text-dark-fg z-10 relative">
                    {Number(o.amount).toLocaleString("ru-RU", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <span className="text-right text-light-fg dark:text-dark-fg z-10 relative">
                    {Number(o.price * o.amount).toLocaleString("ru-RU", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
