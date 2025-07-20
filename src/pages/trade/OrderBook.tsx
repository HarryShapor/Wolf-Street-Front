import React, { useRef, useEffect, useState, useMemo } from "react";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import Card from "../../components/ui/Card";

interface OrderBookProps {
  instrumentId: number;
}

const ROW_HEIGHT = 28;
const LEVELS = 10;

export default function OrderBook({ instrumentId }: OrderBookProps) {
  const [orderBookSell, setOrderBookSell] = useState<{ price: number; amount: number }[]>([]);
  const [orderBookBuy, setOrderBookBuy] = useState<{ price: number; amount: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsClientRef = useRef<Client | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRows, setVisibleRows] = useState(LEVELS);

  // REST-запрос для инициализации стакана
  useEffect(() => {
    setOrderBookSell([]);
    setOrderBookBuy([]);
    if (!instrumentId) return;
    setLoading(true);
    setError(null);
    fetch(`http://wolf-street.ru/market-data-service/api/v1/orderbook/${instrumentId}/aggregated?limitLevels=${LEVELS}`)
      .then(res => {
        if (!res.ok) throw new Error("Ошибка загрузки стакана");
        return res.json();
      })
      .then(data => {
        setOrderBookBuy(
          Array.isArray(data.bids)
            ? data.bids.map((o: any) => ({ price: o.lotPrice, amount: o.totalCount }))
            : []
        );
        setOrderBookSell(
          Array.isArray(data.asks)
            ? data.asks.map((o: any) => ({ price: o.lotPrice, amount: o.totalCount }))
            : []
        );
        setLoading(false);
        // Удаляю старый лог
        // console.log('[REST] instrumentId', instrumentId, 'asks', data.asks, 'bids', data.bids);
      })
      .catch(e => {
        setError(e.message || "Ошибка загрузки стакана");
        setOrderBookBuy([]);
        setOrderBookSell([]);
        setLoading(false);
      });
  }, [instrumentId]);

  // WebSocket для обновления стакана
  useEffect(() => {
    if (!instrumentId) return;
    if (wsClientRef.current) {
      wsClientRef.current.deactivate();
      wsClientRef.current = null;
    }
    const socket = new SockJS("http://wolf-street.ru/market-data-service/ws-market-data");
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 0,
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
    });
    wsClientRef.current = client;
    client.onConnect = () => {
      client.subscribe(`/topic/aggregated/${instrumentId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          // Проверяем instrumentId в сообщении, если есть
          if (data.instrumentId && data.instrumentId !== instrumentId) {
            // console.log('[WS] Пропущено: instrumentId не совпадает', data.instrumentId, instrumentId);
            return;
          }
          // Атомарно обновляем обе стороны стакана
          if (Array.isArray(data.bids) && Array.isArray(data.asks)) {
            setOrderBookBuy(data.bids.map((o: any) => ({ price: o.lotPrice, amount: o.totalCount })));
            setOrderBookSell(data.asks.map((o: any) => ({ price: o.lotPrice, amount: o.totalCount })));
            // Удаляю старый лог
            // console.log('[WS] instrumentId', instrumentId, 'asks', data.asks, 'bids', data.bids);
          }
        } catch (e) {
          // console.log('[WS] Ошибка парсинга', e);
        }
      });
    };
    client.activate();
    return () => {
      if (wsClientRef.current) {
        wsClientRef.current.deactivate();
        wsClientRef.current = null;
      }
    };
  }, [instrumentId]);

  // Для визуализации: ищем максимальный объём среди всех заявок
  const asks = [...orderBookSell]
    .filter(a => a && typeof a.price === 'number' && typeof a.amount === 'number')
    // .reverse() // убираю reverse, чтобы asks шли от большего к меньшему сверху вниз
    .slice(0, visibleRows);
  const bids = orderBookBuy
    .filter(b => b && typeof b.price === 'number' && typeof b.amount === 'number')
    .slice(0, visibleRows);
  const maxAskVolume = Math.max(...asks.map((o) => o.price * o.amount), 1);
  const maxBidVolume = Math.max(...bids.map((o) => o.price * o.amount), 1);

  // --- Визуальное выделение изменившихся строк ---
  const [changedAsks, setChangedAsks] = useState<number[]>([]);
  const [changedBids, setChangedBids] = useState<number[]>([]);
  const prevAsksRef = useRef<typeof orderBookSell>([]);
  const prevBidsRef = useRef<typeof orderBookBuy>([]);

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

  // Для spread
  const bestAsk = orderBookSell.length > 0 ? orderBookSell[0].price : null;
  const bestBid = orderBookBuy.length > 0 ? orderBookBuy[0].price : null;
  const spread = (bestAsk !== null && bestBid !== null) ? (bestAsk - bestBid) : null;
  const midPrice = (bestAsk !== null && bestBid !== null) ? ((bestAsk + bestBid) / 2) : null;

  // Для анимации/цвета spread
  const [prevSpread, setPrevSpread] = useState<number | null>(null);
  const [spreadColor, setSpreadColor] = useState<string>(
    "text-light-fg dark:text-dark-fg"
  );
  const [spreadArrow, setSpreadArrow] = useState<null | 'up' | 'down'>(null);
  useEffect(() => {
    if (typeof spread === "number" && !isNaN(spread)) {
      if (prevSpread !== null && typeof prevSpread === "number" && !isNaN(prevSpread)) {
        if (spread > prevSpread) {
          setSpreadColor("text-green-600 dark:text-green-400");
          setSpreadArrow('up');
        } else if (spread < prevSpread) {
          setSpreadColor("text-red-500 dark:text-red-400");
          setSpreadArrow('down');
        } else {
          setSpreadColor("text-light-fg dark:text-dark-fg");
          setSpreadArrow(null);
        }
      }
      setPrevSpread(spread);
    }
  }, [spread]);

  // Логирование spread
  useEffect(() => {
    if (instrumentId && bestAsk !== null && bestBid !== null && spread !== null && midPrice !== null) {
      console.log(`[SPREAD] instrumentId=${instrumentId} bestAsk=${bestAsk} bestBid=${bestBid} spread=${spread} midPrice=${midPrice}`);
    }
  }, [instrumentId, bestAsk, bestBid, spread, midPrice]);

  // Форматирование
  const format = (n: number | null) => n !== null ? n.toLocaleString("ru-RU", { maximumFractionDigits: 2 }) : "—";

  if (!instrumentId) {
    return <div>Выберите инструмент для отображения стакана</div>;
  }
  if (loading) return <div>Загрузка стакана...</div>;
  if (error) return <div>Ошибка: {error}</div>;

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
            <h3 className="font-extrabold text-light-fg dark:text-white text-base tracking-wide text-center flex-1 mb-0 mt-0 leading-tight">
              Биржевой стакан
            </h3>
            <div className="grid grid-cols-3 gap-0 px-2 pb-0 pt-0 select-none mt-0">
              <span className="text-right font-medium text-light-fg dark:text-white text-[10px]">
                Цена
              </span>
              <span className="text-right font-medium text-light-fg dark:text-white text-[10px] pr-4">
                Кол-во
              </span>
              <span className="text-right font-medium text-light-fg dark:text-white text-[10px] min-w-[60px]">
                Сумма
              </span>
            </div>
          </div>
          <div className="flex flex-col h-72 w-full text-xs font-mono">
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
                    {format(o.price)}
                  </span>
                  <span className="text-right text-light-fg dark:text-white z-10 relative pr-4">
                    {format(o.amount)}
                  </span>
                  <span className="text-right text-light-fg dark:text-white z-10 relative min-w-[60px]">
                    {format(o.price * o.amount)}
                  </span>
                </div>
              ))}
            </div>
            {/* SPREAD (mid price) — по центру */}
            <div className="grid grid-cols-3 gap-0 px-2 py-1 min-h-[28px] bg-light-bg/80 dark:bg-dark-bg/80 rounded font-extrabold text-[16px] border-y border-light-border/30 dark:border-dark-border/30 my-1">
              <span className={`text-right font-bold transition-colors duration-300 flex items-center justify-end gap-1 ${spreadColor}`}>
                {typeof midPrice === "number" && !isNaN(midPrice)
                  ? <>
                      {format(midPrice)}
                      {prevSpread !== null && spread > prevSpread && (
                        <span className="ml-1 text-green-500">▲</span>
                      )}
                      {prevSpread !== null && spread < prevSpread && (
                        <span className="ml-1 text-red-500">▼</span>
                      )}
                    </>
                  : "—"}
              </span>
              <span className="text-center text-xs font-bold text-light-fg dark:text-dark-fg flex items-center justify-center gap-1">
                {typeof spread === "number" && !isNaN(spread)
                  ? <>
                      {format(spread)}
                      {spreadArrow === 'up' && typeof spread === 'number' && typeof prevSpread === 'number' && spread > prevSpread && <span className="ml-1">▲</span>}
                      {spreadArrow === 'down' && typeof spread === 'number' && typeof prevSpread === 'number' && spread < prevSpread && <span className="ml-1">▼</span>}
                    </>
                  : ""}
              </span>
              <span className="text-right text-xs text-light-fg dark:text-white"></span>
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
                    {format(o.price)}
                  </span>
                  <span className="text-right text-light-fg dark:text-white z-10 relative pr-4">
                    {format(o.amount)}
                  </span>
                  <span className="text-right text-light-fg dark:text-white z-10 relative min-w-[60px]">
                    {format(o.price * o.amount)}
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
