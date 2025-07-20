import { useState, useEffect, useRef, useMemo } from "react";
import CandlestickChart from "../../components/ui/CandlestickChart";
import Header from "../../components/header/Header";
import OrderBook from "./OrderBook";
// import TradeChart from "./TradeChart";
import TradesList from "./TradesList";
import InstrumentSelector from "./InstrumentSelector";
import TradeFormWithTabs from "./TradeFormWithTabs";
import UserOrdersSection from "./UserOrdersSection";
import { API_HOST } from "../../services/Api";
import { useInstruments } from "../../hooks/useInstruments";
import type { Instrument } from "../../hooks/useInstruments";
import { useInstrumentImages } from "../../hooks/useInstrumentImages";
import btcIcon from "../../image/crypto/bitcoin.svg";
import ethIcon from "../../image/crypto/ethereum.svg";
import usdtIcon from "../../image/crypto/usdt.svg";
import tonIcon from "../../image/crypto/ton.svg";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";

// Добавлено для устранения ошибки типов sockjs-client
// @ts-ignore
// eslint-disable-next-line
declare module "sockjs-client";

// Хук для получения заявок ордербука с API (bids = buy, asks = sell)

// function getWsHost() {
//   // Можно вынести в env/config
//   const apiHost = API_HOST.replace(/^http/, "ws");
//   return apiHost;
// }

function TradePage() {
  const {
    instruments
  } = useInstruments();
  const [selected, setSelected] = useState<Instrument | null>(() => {
    const savedTicker = localStorage.getItem('selectedInstrumentTicker');
    if (savedTicker && instruments && instruments.length > 0) {
      const found = instruments.find(inst => inst.ticker === savedTicker);
      if (found) return found;
    }
    return null;
  });
  const [timeframe, setTimeframe] = useState("1m");
  const [profitability, setProfitability] = useState<{
    loading: boolean;
    error: string | null;
    data: any;
  }>({ loading: false, error: null, data: null });
  const [candles, setCandles] = useState<any[]>([]); // Changed type to any[]
  const [profitPeriod, setProfitPeriod] = useState<"1d" | "1w" | "1m">("1d");

  // Добавляем состояние для Header
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchPos, setSearchPos] = useState<{
    top: number;
    left: number;
  } | null>(null);

  // Refs для WebSocket соединений
  const ohlcStompClientRef = useRef<Client | null>(null);
  const ohlcSubscriptionRef = useRef<any>(null);
  const ohlcSocketRef = useRef<any>(null); // Добавляем ref для SockJS

  // Для примера: сопоставим ticker -> instrumentId
  const symbolToId = Object.fromEntries(
    instruments.map((inst) => [inst.ticker, inst.instrumentId])
  );
  const instrumentId =
    selected && symbolToId[selected.ticker] ? symbolToId[selected.ticker] : 0;

  // Загружаем иконки инструментов
  const { images: instrumentImages, loading: loadingImages } =
    useInstrumentImages(instruments.map((inst) => inst.instrumentId));

  // Функция для получения fallback иконки
  const getFallbackIcon = (ticker?: string): string => {
    if (!ticker) return btcIcon;

    const iconMap: Record<string, string> = {
      BTC: btcIcon,
      ETH: ethIcon,
      USDT: usdtIcon,
      TON: tonIcon,
    };
    return iconMap[ticker.toUpperCase()] || btcIcon;
  };

  // Получаем иконку для выбранного инструмента
  const selectedInstrumentIcon = useMemo(() => {
    if (!selected) return btcIcon;

    const iconUrl = instrumentImages[selected.instrumentId];
    return iconUrl || getFallbackIcon(selected.ticker);
  }, [selected, instrumentImages]);

  // 1. Загружаем историю через REST
  useEffect(() => {
    if (!instrumentId || !timeframe) return;
    setCandles([]); // сбрасываем при смене инструмента/таймфрейма
    const fromISO = "1970-01-01T00:00:00.000Z";
    const toISO = new Date().toISOString();
    fetch(
      `${API_HOST}/market-data-service/api/v1/ohlc/${instrumentId}?interval=${timeframe}&from=${fromISO}&to=${toISO}`
    )
      .then((res) => res.json())
      .then((data) => {
        const normalized = Array.isArray(data)
          ? data.map((c: any) => ({ ...c, time: c.openTime }))
          : [];
        setCandles(normalized);
      });
  }, [instrumentId, timeframe]);

  // 2. Подписываемся на новые свечи через SockJS/STOMP
  useEffect(() => {
    if (!instrumentId || !timeframe) return;

    // Очистка предыдущего соединения
    if (ohlcSubscriptionRef.current) {
      ohlcSubscriptionRef.current.unsubscribe();
      ohlcSubscriptionRef.current = null;
    }
    if (ohlcStompClientRef.current) {
      ohlcStompClientRef.current.deactivate();
      ohlcStompClientRef.current = null;
    }
    if (ohlcSocketRef.current) {
      ohlcSocketRef.current.close();
      ohlcSocketRef.current = null;
    }

    const socket = new SockJS(
      "http://wolf-street.ru/market-data-service/ws-market-data"
    );
    ohlcSocketRef.current = socket;

    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 0, // Отключаем автоматическое переподключение
      heartbeatIncoming: 0,
      heartbeatOutgoing: 0,
    });

    ohlcStompClientRef.current = stompClient;

    stompClient.onConnect = () => {
      if (ohlcStompClientRef.current !== stompClient) return;

      ohlcSubscriptionRef.current = stompClient.subscribe(
        `/topic/ohlc/${instrumentId}/${timeframe}`,
        (message: any) => {
          try {
            const raw = JSON.parse(message.body);
            const newCandle = Array.isArray(raw) ? raw[raw.length - 1] : raw;
            if (newCandle && newCandle.openTime) {
              setCandles((prev) => {
                const filtered = prev.filter(
                  (c) => c.time !== newCandle.openTime
                );
                return [
                  ...filtered,
                  { ...newCandle, time: newCandle.openTime },
                ];
              });
            }
          } catch (e) {
            console.error("[STOMP] OHLC parse error:", e);
          }
        }
      );
    };

    // Добавляем обработчик ошибок, чтобы не было висящих соединений
    stompClient.onStompError = (frame: any) => {
      console.error("[STOMP] OHLC Error:", frame);
      // Принудительно закрываем при ошибке
      if (ohlcStompClientRef.current) {
        ohlcStompClientRef.current.forceDisconnect();
      }
    };

    stompClient.activate();

    return () => {
      if (ohlcSubscriptionRef.current) {
        ohlcSubscriptionRef.current.unsubscribe();
        ohlcSubscriptionRef.current = null;
      }
      if (ohlcStompClientRef.current) {
        ohlcStompClientRef.current.forceDisconnect(); // Используем forceDisconnect вместо deactivate
        ohlcStompClientRef.current = null;
      }
      if (ohlcSocketRef.current) {
        ohlcSocketRef.current.close();
        ohlcSocketRef.current = null;
      }
    };
  }, [instrumentId, timeframe]);

  // Выбор первого инструмента после загрузки
  useEffect(() => {
    if (instruments.length && !selected) {
      const savedTicker = localStorage.getItem('selectedInstrumentTicker');
      if (savedTicker) {
        const found = instruments.find(inst => inst.ticker === savedTicker);
        if (found) {
          setSelected(found);
          return;
        }
      }
      setSelected(instruments[0]);
    }
  }, [instruments, selected]);

  // Загрузка аналитики
  useEffect(() => {
    if (!selected?.instrumentId) return;
    let timer: number;
    const fetchProfitability = () => {
      setProfitability({ loading: true, error: null, data: null });
      fetch(
        `${API_HOST}/analytic-service/api/v1/profitability?instrumentIds=${selected.instrumentId}&period=${profitPeriod}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      )
        .then((res) => {
          if (!res.ok) {
            if (res.status === 404)
              throw new Error("Нет аналитики для этого инструмента");
            if (res.status === 401 || res.status === 403)
              throw new Error("Не авторизован");
            if (res.status === 400) throw new Error("Некорректный запрос");
            throw new Error("Нет аналитики для этого инструмента");
          }
          return res.json();
        })
        .then((data) => setProfitability({ loading: false, error: null, data }))
        .catch((e) =>
          setProfitability({ loading: false, error: e.message, data: null })
        );
    };
    fetchProfitability();
    timer = setInterval(fetchProfitability, 10000);
    return () => clearInterval(timer);
  }, [selected?.instrumentId, profitPeriod]);

  // Исправляем headerProps с реальными функциями
  const headerProps = {
    scrolled: false,
    NAV: [],
    setSearchPos: (pos: { top: number; left: number }) => setSearchPos(pos),
    activeSection: "",
    headerVisible: true,
    setSearchOpen: (open: boolean) => setSearchOpen(open),
    searchOpen: searchOpen,
  };

  // function handleAllClick() {
  //   setAmount((balance / 1).toFixed(6)); // price неизвестен, ставим 1
  // }

  // Фильтры для правой колонки
  // const [marketFilter, setMarketFilter] = useState("USDT");
  // const marketTabs = ["USDT", "FDUSD", "BNB"];
  // const filteredInstruments = instruments.filter((inst) =>
  //   inst.ticker.endsWith(marketFilter)
  // );

  // Перед рендером графика логируем итоговые данные
  console.log("CandlestickChart data:", candles);

  return (
    <>
      <div className="h-screen bg-light-bg dark:bg-dark-bg overflow-hidden">
        <Header {...headerProps} />

        {/* Добавляем SearchModal если нужен */}
        {searchOpen && (
          <div
            className="fixed inset-0 z-50 bg-black bg-opacity-50"
            onClick={() => setSearchOpen(false)}
          >
            <div
              className="absolute bg-white dark:bg-dark-card rounded-lg shadow-lg p-4 w-80"
              style={{
                top: searchPos?.top || 60,
                left: searchPos?.left || 20,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <input
                type="text"
                placeholder="Поиск..."
                className="w-full px-3 py-2 border rounded"
                autoFocus
              />
            </div>
          </div>
        )}

        <div className="pt-24 w-full max-w-[1800px] mx-auto px-2 md:px-4 lg:px-0">
          {/* Верхняя часть: три колонки */}
          <div className="flex flex-row gap-4 items-stretch w-full mb-2">
            {/* Левая колонка: стакан и выбор инструмента */}
            <div className="flex flex-col gap-1 w-[280px] min-w-[220px] max-w-[320px] h-[700px] justify-start animate-portfolio-fade" style={{animationDelay: '0.2s', animationDuration: '1.1s'}}>
              <InstrumentSelector
                value={selected?.ticker || ""}
                onChange={(ticker) => {
                  const found = instruments.find(
                    (inst) => inst.ticker === ticker
                  );
                  if (found) {
                    setSelected(found);
                    localStorage.setItem('selectedInstrumentTicker', found.ticker);
                  }
                }}
                options={instruments.map((inst) => ({
                  ticker: inst.ticker,
                  title: inst.title,
                }))}
              />
              <div className="flex-1 flex flex-col justify-start">
                <OrderBook instrumentId={instrumentId} />
              </div>
            </div>
            {/* Центральная колонка: график */}
            <div className="flex-1 min-w-[700px] max-w-[1400px] animate-portfolio-fade" style={{animationDelay: '0.4s', animationDuration: '1.1s'}}>
              <div className="rounded-2xl shadow-2xl bg-transparent border border-light-border/40 dark:border-dark-border/40 p-2 h-[700px] flex flex-col">
                {/* --- Верхняя панель: название, доходность, периоды --- */}
                <div className="flex flex-wrap items-center gap-4 mb-2 justify-between flex-shrink-0">
                  {/* Левая часть: название, доходность, периоды доходности */}
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Иконка инструмента */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/90 dark:bg-[#23243a]/90 border-2 border-light-accent dark:border-dark-accent shadow">
                      {loadingImages ? (
                        <div className="w-6 h-6 rounded-full bg-light-accent/20 dark:bg-dark-accent/20 animate-pulse flex items-center justify-center">
                          <div className="w-3 h-3 rounded-full bg-light-accent/40 dark:bg-dark-accent/40"></div>
                        </div>
                      ) : (
                        <img
                          src={selectedInstrumentIcon}
                          alt={selected?.ticker || "Инструмент"}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            // При ошибке загрузки иконки используем fallback
                            const target = e.target as HTMLImageElement;
                            target.src = getFallbackIcon(selected?.ticker);
                          }}
                        />
                      )}
                    </div>
                    <span className="text-2xl font-bold text-light-accent dark:text-dark-accent truncate">
                      {selected?.title} ({selected?.ticker})
                    </span>
                    {/* Доходность и стрелка */}
                    {profitability.loading ? (
                      <span className="text-xs text-light-fg-secondary dark:text-dark-brown ml-2">
                        Загрузка...
                      </span>
                    ) : profitability.data &&
                      selected &&
                      String(selected.instrumentId) in profitability.data ? (
                      (() => {
                        const val = Number(
                          profitability.data[String(selected.instrumentId)]
                        );
                        const isUp = val > 0;
                        const isDown = val < 0;
                        const isZero = val === 0;
                        return (
                          <span
                            className={
                              "text-sm font-semibold flex items-center gap-1 ml-2 " +
                              (isUp
                                ? "text-green-600 dark:text-green-400"
                                : isDown
                                ? "text-red-500 dark:text-red-400"
                                : isZero
                                ? "text-light-fg dark:text-dark-fg"
                                : "")
                            }
                          >
                            {(val * 100).toFixed(2)}%{isUp && <span>↑</span>}
                            {isDown && <span>↓</span>}
                          </span>
                        );
                      })()
                    ) : null}
                    {/* Переключатель периода доходности */}
                    <div className="flex gap-1 ml-2">
                      {["1d", "1w", "1m"].map((p) => (
                        <button
                          key={p}
                          className={`px-2 py-0.5 rounded text-xs font-bold border transition-colors duration-150
                            ${
                              profitPeriod === p
                                ? "bg-light-accent text-white dark:bg-dark-accent dark:text-dark-bg border-light-accent dark:border-dark-accent"
                                : "bg-transparent text-light-fg dark:text-dark-fg border-light-border dark:border-dark-border"
                            }
                          `}
                          onClick={() =>
                            setProfitPeriod(p as "1d" | "1w" | "1m")
                          }
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Правая часть: таймфреймы графика */}
                  <div className="flex gap-1 ml-auto">
                    {["1m", "5m", "15m", "1h", "1d"].map((tf) => (
                      <button
                        key={tf}
                        className={`px-3 pb-1 pt-0.5 border-b-2 text-base font-medium tracking-wide transition-colors duration-200
                          ${
                            timeframe === tf
                              ? "border-light-accent text-light-accent dark:border-dark-accent dark:text-dark-accent"
                              : "border-transparent text-light-fg dark:text-dark-fg hover:text-light-accent dark:hover:text-dark-accent hover:border-light-accent dark:hover:border-dark-accent"
                          }
                        `}
                        style={{
                          borderRadius: 0,
                          background: "none",
                          boxShadow: "none",
                        }}
                        onClick={() => setTimeframe(tf)}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1 w-full overflow-hidden">
                  <CandlestickChart
                    data={
                      Array.isArray(candles)
                        ? candles
                            .filter((c) => c && c.time)
                            .map((c) => ({
                              ...c,
                              time: c.time as any,
                            }))
                        : []
                    }
                  />
                </div>
              </div>
            </div>
            {/* Правая колонка: форма и история сделок */}
            <div className="flex flex-col gap-2 w-[320px] min-w-[280px] max-w-[420px] animate-portfolio-fade" style={{animationDelay: '0.6s', animationDuration: '1.1s'}}>
              <div className="rounded-2xl shadow-2xl bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border border-light-border/40 dark:border-dark-border/40">
                <TradeFormWithTabs />
              </div>
              <div className="rounded-2xl shadow-2xl bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border border-light-border/40 dark:border-dark-border/40 flex-1">
                <div className="h-[500px]">
                  {" "}
                  {/* Увеличиваем высоту блока рыночных сделок */}
                  <TradesList instrumentId={instrumentId} />
                </div>
              </div>
            </div>
          </div>
          {/* Нижняя часть: заявки пользователя */}
          <div
            className="w-[1464px] min-w-[280px] max-w-[1800px] relative animate-portfolio-fade"
            style={{ marginTop: "-300px", animationDelay: '0.8s', animationDuration: '1.1s' }}
          >
            <div className="rounded-2xl shadow-2xl bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border border-light-border/40 dark:border-dark-border/40">
              <div className="h-[290px]">
                {/* Увеличиваем высоту блока заявок */}
                <UserOrdersSection />
              </div>
            </div>
          </div>
          <div className="h-8"></div>
        </div>
      </div>
    </>
  );
}

export default TradePage;
