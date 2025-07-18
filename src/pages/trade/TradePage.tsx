import React, { useState, useEffect } from 'react';
import CandlestickChart from '../../components/ui/CandlestickChart';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Header from '../../components/header/Header';
import CustomSelect from '../../components/ui/CustomSelect';
import OrderBook from './OrderBook';
import TradeChart from './TradeChart';
import TradesList from './TradesList';
import InstrumentSelector from './InstrumentSelector';
import TradeFormWithTabs from './TradeFormWithTabs';
import UserOrdersSection from './UserOrdersSection';
import { API_HOST } from '../../services/Api';
import { useInstruments } from '../../hooks/useInstruments';
import type { Instrument } from '../../hooks/useInstruments';
import InstrumentsList from '../instruments/InstrumentsList';
import { useNavigate } from "react-router-dom";
import { createWS } from '../../services/WebSocketService';
import type { OrderBookData, Candle } from '../../services/WebSocketService';
import { USE_WS_MOCK } from '../../services/Api';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// Добавлено для устранения ошибки типов sockjs-client
// @ts-ignore
// eslint-disable-next-line
declare module 'sockjs-client';

const initialPositions = [
  { symbol: 'BTC', amount: 0.02, entry: 60000, pnl: 1000 },
  { symbol: 'ETH', amount: 1.5, entry: 3200, pnl: 450 },
];

const mockBalance = 10000;
// Генерируем столько заявок, сколько помещается без скролла (например, по 8)
const mockOrderBookSell = Array.from({ length: 8 }, (_, i) => ({
  price: 65010 - i * 3,
  amount: +(Math.random() * 0.7 + 0.1).toFixed(2),
}));
const mockOrderBookBuy = Array.from({ length: 8 }, (_, i) => ({
  price: 64995 - i * 3,
  amount: +(Math.random() * 0.7 + 0.1).toFixed(2),
}));
const mockTrades = [
  { price: 65010, amount: 0.01, side: 'buy', time: '12:01:10' },
  { price: 65008, amount: 0.02, side: 'sell', time: '12:01:09' },
  { price: 65005, amount: 0.03, side: 'buy', time: '12:01:08' },
  { price: 65000, amount: 0.01, side: 'sell', time: '12:01:07' },
  { price: 64995, amount: 0.04, side: 'buy', time: '12:01:06' },
];

// Хук для получения заявок ордербука с API (bids = buy, asks = sell)
function useOrderBook(instrumentId: number, limit: number = 8) {
  const [sell, setSell] = useState<{ price: number; amount: number }[]>([]);
  const [buy, setBuy] = useState<{ price: number; amount: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!instrumentId) return;
    let ignore = false;
    setLoading(true);
    setError(null);
    fetch(`${API_HOST}/market-data-service/api/v1/orderbook/${instrumentId}?limitOrders=${limit}`)
      .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки стакана');
        return res.json();
      })
      .then(data => {
        if (ignore) return;
        setSell(Array.isArray(data.asks) ? data.asks : []);
        setBuy(Array.isArray(data.bids) ? data.bids : []);
      })
      .catch(e => setError(e.message || 'Ошибка загрузки стакана'))
      .finally(() => setLoading(false));
    return () => { ignore = true; };
  }, [instrumentId, limit]);

  return { sell, buy, loading, error };
}

function getWsHost() {
  // Можно вынести в env/config
  const apiHost = API_HOST.replace(/^http/, 'ws');
  return apiHost;
}

// Хук для получения OHLC-данных
function useOhlcData(instrumentId: number, interval: string, hours: number = 12, useWebSocket = false) {
  const [data, setData] = useState<Candle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!instrumentId || !interval) return;
    let ws: any = null;
    let ignore = false;
    if (USE_WS_MOCK) {
      setLoading(true);
      setError(null);
      ws = createWS('ohlc', instrumentId);
      ws.on('message', (event: any) => {
        if (ignore) return;
        const candles: Candle[] = JSON.parse(event.data);
        setData(candles);
        setLoading(false);
      });
      ws.on('error', () => setError('Ошибка WebSocket'));
    } else if (useWebSocket) {
      setLoading(true);
      setError(null);
      // Используем SockJS вместо WebSocket
      const wsUrl = 'http://wolf-street.ru/market-data-service/ws-market-data';
      ws = new SockJS(wsUrl);
      ws.onopen = () => setLoading(false);
      ws.onmessage = (event: MessageEvent) => {
        if (ignore) return;
        try {
          const candles: Candle[] = JSON.parse(event.data);
          setData(candles);
        } catch (e) {
          setError('Ошибка парсинга данных WebSocket');
        }
      };
      ws.onerror = () => setError('Ошибка WebSocket');
    } else {
      const to = new Date();
      const from = new Date(to.getTime() - hours * 60 * 60 * 1000);
      const fromISO = from.toISOString();
      const toISO = to.toISOString();
      setLoading(true);
      setError(null);
      fetch(`${API_HOST}/market-data-service/api/v1/ohlc/${instrumentId}?interval=${interval}&from=${fromISO}&to=${toISO}`)
        .then(res => {
          if (!res.ok) throw new Error('Ошибка получения данных для графика');
          return res.json();
        })
        .then(setData)
        .catch(e => setError(e.message))
        .finally(() => setLoading(false));
    }
    return () => { ignore = true; if (ws) ws.close && ws.close(); };
  }, [instrumentId, interval, hours, useWebSocket]);

  return { data, loading, error };
}

// Удаляю генератор mockCandles и все, что с ним связано

function TradePage() {
  const { instruments, loading: loadingInstruments, error: errorInstruments } = useInstruments();
  const [selected, setSelected] = useState<Instrument | null>(null);
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState<'buy'|'sell'>('buy');
  const [search, setSearch] = useState('');
  const [timeframe, setTimeframe] = useState('1h');
  const [positions, setPositions] = useState(initialPositions);
  const [balance] = useState(mockBalance);
  const [orderType, setOrderType] = useState<'limit'|'market'>('limit');
  const navigate = useNavigate();
  const [profitability, setProfitability] = useState<{ loading: boolean; error: string | null; data: any }>({ loading: false, error: null, data: null });
  const [candles, setCandles] = useState<Candle[]>([]);
  const [profitPeriod, setProfitPeriod] = useState<'1d' | '1w' | '1m'>('1d');

  // Для примера: сопоставим ticker -> instrumentId
  const symbolToId = Object.fromEntries(instruments.map(inst => [inst.ticker, inst.instrumentId]));
  const instrumentId = selected && symbolToId[selected.ticker] ? symbolToId[selected.ticker] : 0;

  // 1. Загружаем историю через REST
  useEffect(() => {
    if (!instrumentId || !timeframe) return;
    setCandles([]); // сбрасываем при смене инструмента/таймфрейма
    const to = new Date();
    const from = new Date(to.getTime() - 12 * 60 * 60 * 1000); // 12 часов
    const fromISO = from.toISOString();
    const toISO = to.toISOString();
    fetch(`${API_HOST}/market-data-service/api/v1/ohlc/${instrumentId}?interval=${timeframe}&from=${fromISO}&to=${toISO}`)
      .then(res => res.json())
      .then(data => {
        const normalized = Array.isArray(data)
          ? data.map((c: any) => ({ ...c, time: c.openTime }))
          : [];
        setCandles(normalized);
      });
  }, [instrumentId, timeframe]);

  // 2. Подписываемся на новые свечи через SockJS/STOMP
  useEffect(() => {
    if (!instrumentId || !timeframe) return;
    const socket = new SockJS('http://wolf-street.ru/market-data-service/ws-market-data');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });
    let subscription: any = null;
    stompClient.onConnect = () => {
      subscription = stompClient.subscribe(`/topic/ohlc/${instrumentId}/${timeframe}`, (message) => {
        try {
          const raw = JSON.parse(message.body);
          const newCandle = Array.isArray(raw) ? raw[raw.length - 1] : raw;
          if (newCandle && newCandle.openTime) {
            setCandles(prev => {
              // если уже есть свеча с таким временем — заменяем, иначе добавляем
              const filtered = prev.filter(c => c.time !== newCandle.openTime);
              return [...filtered, { ...newCandle, time: newCandle.openTime }];
            });
          }
        } catch (e) {
          console.error('[STOMP] OHLC parse error:', e);
        }
      });
    };
    stompClient.activate();
    return () => {
      if (subscription) subscription.unsubscribe();
      stompClient.deactivate();
    };
  }, [instrumentId, timeframe]);

  // Выбор первого инструмента после загрузки
  useEffect(() => {
    if (instruments.length && !selected) {
      setSelected(instruments[0]);
    }
  }, [instruments, selected]);

  // Загрузка аналитики
  useEffect(() => {
    if (!selected?.instrumentId) return;
    setProfitability({ loading: true, error: null, data: null });
    fetch(`${API_HOST}/analytic-service/api/v1/profitability?instrumentIds=${selected.instrumentId}&period=${profitPeriod}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('Нет аналитики для этого инструмента');
          if (res.status === 401 || res.status === 403) throw new Error('Не авторизован');
          if (res.status === 400) throw new Error('Некорректный запрос');
          throw new Error('Нет аналитики для этого инструмента');
        }
        return res.json();
      })
      .then(data => setProfitability({ loading: false, error: null, data }))
      .catch(e => setProfitability({ loading: false, error: e.message, data: null }));
  }, [selected?.instrumentId, profitPeriod]);

  const filtered = instruments.filter(inst =>
    inst.ticker.toLowerCase().includes(search.toLowerCase()) ||
    inst.title.toLowerCase().includes(search.toLowerCase())
  );

  // Используем instrumentId для стакана и графика
  const { sell: orderBookSell, buy: orderBookBuy, loading: loadingOrderBook, error: errorOrderBook } = useOrderBook(instrumentId, 10);
  // Подписка на OHLC через STOMP/SockJS при изменении instrumentId или timeframe
  // const [ohlcStompData, setOhlcStompData] = useState<Candle[]>([]);
  // useEffect(() => {
  //   if (!instrumentId || !timeframe) return;
  //   console.log(`[STOMP] Opening SockJS WebSocket for OHLC: instrumentId=${instrumentId}, interval=${timeframe}`);
  //   const socket = new SockJS('http://wolf-street.ru/market-data-service/ws-market-data');
  //   const stompClient = new Client({
  //     webSocketFactory: () => socket,
  //     debug: (str) => {},
  //     reconnectDelay: 5000,
  //   });
  //   let subscription: any = null;
  //   stompClient.onConnect = () => {
  //     subscription = stompClient.subscribe(`/topic/ohlc/${instrumentId}/${timeframe}`, (message) => {
  //       try {
  //         const raw = JSON.parse(message.body);
  //         console.log('[STOMP] OHLC raw:', raw);
  //         // Нормализуем time
  //         const candles = Array.isArray(raw) ? raw.map(c => ({
  //           ...c,
  //           time: typeof c.time === 'string' ? Math.floor(new Date(c.time).getTime() / 1000) : c.time
  //         })) : [];
  //         setOhlcStompData(candles);
  //         console.log('[STOMP] OHLC normalized:', candles);
  //       } catch (e) {
  //         console.error('[STOMP] OHLC parse error:', e);
  //       }
  //     });
  //   };
  //   stompClient.onStompError = (frame) => {
  //     console.error('[STOMP] Error:', frame.headers['message'], frame.body);
  //   };
  //   stompClient.activate();
  //   return () => {
  //     if (subscription) subscription.unsubscribe();
  //     stompClient.deactivate();
  //   };
  // }, [instrumentId, timeframe]);
  // Используем данные из STOMP если они есть, иначе fallback на REST
  // const { data: ohlcRestData, loading: loadingOhlc, error: errorOhlc } = useOhlcData(instrumentId ?? 0, timeframe, 12, false);
  // const ohlcData = ohlcStompData.length > 0 ? ohlcStompData : ohlcRestData;

  // Подписка на агрегированный стакан через SockJS/STOMP
  const [aggregatedOrderBook, setAggregatedOrderBook] = useState<any>(null);
  useEffect(() => {
    if (!instrumentId) return;
    console.log(`[STOMP] Opening SockJS WebSocket for AGGREGATED ORDERBOOK: instrumentId=${instrumentId}`);
    const socket = new SockJS('http://wolf-street.ru/market-data-service/ws-market-data');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {},
      reconnectDelay: 5000,
    });
    let subscription: any = null;
    stompClient.onConnect = () => {
      subscription = stompClient.subscribe(`/topic/aggregated/${instrumentId}`, (message) => {
        try {
          const data = JSON.parse(message.body);
          setAggregatedOrderBook(data);
          console.log('[STOMP] AGGREGATED ORDERBOOK update:', data);
        } catch {}
      });
    };
    stompClient.onStompError = (frame) => {
      console.error('[STOMP] Error (aggregated):', frame.headers['message'], frame.body);
    };
    stompClient.activate();
    return () => {
      if (subscription) subscription.unsubscribe();
      stompClient.deactivate();
    };
  }, [instrumentId]);

  // Моки для Header (минимально необходимые пропсы)
  const headerProps = {
    scrolled: false,
    NAV: [],
    setSearchPos: () => {},
    activeSection: '',
    headerVisible: true,
    setSearchOpen: () => {},
    searchOpen: false,
  };

  function handleAllClick() {
    setAmount((balance / 1).toFixed(6)); // price неизвестен, ставим 1
  }

  function handleTrade(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || !selected) return;
    setPositions(prev => [
      ...prev,
      {
        symbol: selected.ticker,
        amount: Number(amount),
        entry: 0, // price неизвестен
        pnl: 0,
      },
    ]);
    setAmount('');
  }

  // Фильтры для правой колонки
  const [marketFilter, setMarketFilter] = useState('USDT');
  const marketTabs = ['USDT', 'FDUSD', 'BNB'];
  const filteredInstruments = instruments.filter(inst => inst.ticker.endsWith(marketFilter));

  // Перед рендером графика логируем итоговые данные
  console.log('CandlestickChart data:', candles);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg overflow-x-hidden pb-4">
      <Header {...headerProps} />
      <div className="pt-14"> {/* отступ сверху под фиксированный header (56px) */}
        <div className="pt-20 flex flex-col w-full max-w-[1800px] mx-auto gap-4 items-stretch px-2 md:px-4 lg:px-0">
          {/* Верхняя часть: две колонки */}
          <div className="flex flex-row gap-10 justify-center items-stretch">
            {/* Левая колонка */}
            <div className="flex flex-col gap-4 w-[260px] min-w-[180px] h-full justify-end">
              <InstrumentSelector
                value={selected?.ticker || ''}
                onChange={ticker => {
                  const found = instruments.find(inst => inst.ticker === ticker);
                  if (found) setSelected(found);
                }}
                options={filtered.map(inst => ({ ticker: inst.ticker, title: inst.title }))}
              />
              {/* Стакан выравниваем по нижней границе графика */}
              <div className="h-[600px] self-end flex flex-col justify-end">
                <OrderBook
                  price={0}
                  orderBookSell={orderBookSell}
                  orderBookBuy={orderBookBuy}
                  loadingOrderBook={loadingOrderBook}
                  errorOrderBook={errorOrderBook}
                  instrumentId={instrumentId}
                />
              </div>
            </div>
            {/* Правая колонка: график и аналитика сбоку */}
            <div className="w-[1040px] flex flex-row gap-6 items-start">
              <div className="flex-1 rounded-2xl shadow-2xl bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border border-light-border/40 dark:border-dark-border/40 p-2">
                {/* --- Верхняя панель: название, доходность, периоды --- */}
                <div className="flex flex-wrap items-center gap-4 mb-2 justify-between">
                  {/* Левая часть: название, доходность, периоды доходности */}
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl font-bold text-light-accent dark:text-dark-accent truncate">{selected?.title} ({selected?.ticker})</span>
                    {/* Доходность и стрелка */}
                    {profitability.loading ? (
                      <span className="text-xs text-light-fg-secondary dark:text-dark-brown ml-2">Загрузка...</span>
                    ) : profitability.data && selected && String(selected.instrumentId) in profitability.data ? (
                      (() => {
                        const val = Number(profitability.data[String(selected.instrumentId)]);
                        const isUp = val > 0;
                        const isDown = val < 0;
                        return (
                          <span className={"text-sm font-semibold flex items-center gap-1 ml-2 " + (isUp ? 'text-green-600 dark:text-green-400' : isDown ? 'text-red-500 dark:text-red-400' : '')}>
                            {val.toFixed(2)}%
                            {isUp && <span>↑</span>}
                            {isDown && <span>↓</span>}
                          </span>
                        );
                      })()
                    ) : null}
                    {/* Переключатель периода доходности */}
                    <div className="flex gap-1 ml-2">
                      {['1d','1w','1m'].map(p => (
                        <button
                          key={p}
                          className={`px-2 py-0.5 rounded text-xs font-bold border transition-colors duration-150
                            ${profitPeriod === p
                              ? 'bg-light-accent text-white dark:bg-dark-accent dark:text-dark-bg border-light-accent dark:border-dark-accent'
                              : 'bg-transparent text-light-fg dark:text-dark-fg border-light-border dark:border-dark-border hover:bg-light-accent/10 dark:hover:bg-dark-accent/10'}
                          `}
                          onClick={() => setProfitPeriod(p as '1d'|'1w'|'1m')}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Правая часть: таймфреймы графика */}
                  <div className="flex gap-1 ml-auto">
                    {['1m','5m','15m','1h','1d'].map(tf => (
                      <button
                        key={tf}
                        className={`px-2 py-0.5 rounded text-xs font-bold border transition-colors duration-150
                          ${timeframe === tf
                            ? 'bg-green-500 text-white dark:bg-green-400 dark:text-dark-bg border-green-500 dark:border-green-400'
                            : 'bg-transparent text-light-fg dark:text-dark-fg border-light-border dark:border-dark-border hover:bg-green-400/10 dark:hover:bg-green-600/10'}
                        `}
                        onClick={() => setTimeframe(tf)}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                </div>
                <TradeChart
                  data={Array.isArray(candles) ? candles.filter(c => c && c.time) : []}
                  loading={false}
                  error={null}
                  selected={selected}
                  price={0}
                  change={0}
                  timeframe={timeframe}
                  setTimeframe={setTimeframe}
                />
              </div>
            </div>
          </div>
          {/* Нижняя часть: форма, заявки и сделки в одну линию */}
          <div className="flex flex-row gap-4 items-start w-[1392px] mx-auto mt-4">
            <div className="w-[320px] min-w-[320px] max-w-[320px] h-full overflow-visible flex-shrink-0">
              <div className="rounded-2xl shadow-2xl bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border border-light-border/40 dark:border-dark-border/40 p-2">
                <TradeFormWithTabs />
              </div>
            </div>
            <div className="w-[650px] min-w-[650px] max-w-[650px] h-full flex flex-col justify-start">
              <div className="rounded-2xl shadow-2xl bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border border-light-border/40 dark:border-dark-border/40 p-2">
                <UserOrdersSection />
              </div>
            </div>
            <div className="w-[360px] min-w-[360px] max-w-[360px] h-full overflow-visible flex flex-col justify-start">
              <div className="rounded-2xl shadow-2xl bg-white/80 dark:bg-dark-card/80 backdrop-blur-md border border-light-border/40 dark:border-dark-border/40 p-2">
                <TradesList />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TradePage; 