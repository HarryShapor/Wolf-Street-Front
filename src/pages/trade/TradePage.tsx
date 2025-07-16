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
import UserOrdersSection from '../portfolio/components/UserOrdersSection';
import { API_HOST } from '../../services/Api';
import { useInstruments } from '../../hooks/useInstruments';
import type { Instrument } from '../../hooks/useInstruments';
import InstrumentsList from '../instruments/InstrumentsList';

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
    setLoading(true);
    setError(null);
    // fetch(`${API_HOST}/market-data-service/api/v1/orderbook/${instrumentId}?limitOrders=${limit}`)
    fetch(`${API_HOST}/market-data-service/api/v1/orderbook/${instrumentId}?limitOrders=${limit}`)
      .then(res => {
        if (!res.ok) throw new Error('Ошибка получения ордербука');
        return res.json();
      })
      .then(data => {
        setSell(Array.isArray(data.asks) ? data.asks.map((o: any) => ({ price: o.price, amount: o.count })) : []);
        setBuy(Array.isArray(data.bids) ? data.bids.map((o: any) => ({ price: o.price, amount: o.count })) : []);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [instrumentId, limit]);

  return { sell, buy, loading, error };
}

// Хук для получения OHLC-данных
function useOhlcData(instrumentId: number, interval: string, hours: number = 12) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!instrumentId || !interval) return;
    const to = new Date();
    const from = new Date(to.getTime() - hours * 60 * 60 * 1000);
    const fromISO = from.toISOString();
    const toISO = to.toISOString();
    setLoading(true);
    setError(null);
    // fetch(`${API_HOST}/market-data-service/api/v1/ohlc/${instrumentId}?interval=${interval}&from=${fromISO}&to=${toISO}`)
    fetch(`${API_HOST}/market-data-service/api/v1/ohlc/${instrumentId}?interval=${interval}&from=${fromISO}&to=${toISO}`)
      .then(res => {
        if (!res.ok) throw new Error('Ошибка получения данных для графика');
        return res.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [instrumentId, interval, hours]);

  return { data, loading, error };
}

// Удаляю генератор mockCandles и все, что с ним связано

export default function TradePage() {
  const { instruments, loading: loadingInstruments, error: errorInstruments } = useInstruments();
  const [selected, setSelected] = useState<Instrument | null>(null);
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState<'buy'|'sell'>('buy');
  const [search, setSearch] = useState('');
  const [timeframe, setTimeframe] = useState('1h');
  const [positions, setPositions] = useState(initialPositions);
  const [balance] = useState(mockBalance);
  const [orderType, setOrderType] = useState<'limit'|'market'>('limit');

  // Удаляю все useState/useEffect для mockChartData

  // Выбор первого инструмента после загрузки
  useEffect(() => {
    if (instruments.length && !selected) {
      setSelected(instruments[0]);
    }
  }, [instruments, selected]);

  const filtered = instruments.filter(inst =>
    inst.ticker.toLowerCase().includes(search.toLowerCase()) ||
    inst.title.toLowerCase().includes(search.toLowerCase())
  );

  // Для примера: сопоставим ticker -> instrumentId
  const symbolToId = Object.fromEntries(instruments.map(inst => [inst.ticker, inst.instrumentId]));
  const instrumentId = selected ? symbolToId[selected.ticker] : undefined;
  // Используем instrumentId для стакана и графика
  const { sell: orderBookSell, buy: orderBookBuy, loading: loadingOrderBook, error: errorOrderBook } = useOrderBook(instrumentId ?? 0, 8);
  const { data: ohlcData, loading: loadingOhlc, error: errorOhlc } = useOhlcData(instrumentId ?? 0, timeframe, 12);

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

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg overflow-x-hidden pb-4">
      {/* Header с парой, ценой, изменением, поиском */}
      <Header {...headerProps} />
      <div className="pt-20 flex flex-row w-full max-w-[1800px] mx-auto gap-2 items-start px-2 md:px-4 lg:px-0">
        {/* Левая колонка: стакан */}
        <div className="orderbook-col w-[260px] min-w-[180px] flex flex-col gap-2 mr-2">
          <InstrumentSelector
            value={selected?.ticker || ''}
            onChange={ticker => {
              const found = instruments.find(inst => inst.ticker === ticker);
              if (found) setSelected(found);
            }}
            options={filtered.map(inst => ({ symbol: inst.ticker, name: inst.title }))}
          />
          <OrderBook
            price={0}
            orderBookSell={orderBookSell}
            orderBookBuy={orderBookBuy}
            loadingOrderBook={loadingOrderBook}
            errorOrderBook={errorOrderBook}
          />
        </div>
        {/* Центр: график + форма */}
        <div className="flex-1 flex flex-col min-w-0 gap-2">
          {/* Вкладка и таймфреймы */}
          
          <div className="chart-row flex-1 min-h-[50vh]">
            <TradeChart
              data={ohlcData}
              loading={loadingOhlc}
              error={errorOhlc}
              selected={selected}
              price={0}
              change={0}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
            />
          </div>
          {/* Форма ордера — одна, по центру, широкая */}
          <div className="trade-form-row w-full max-w-2xl mx-auto mt-2">
            <TradeFormWithTabs />
          </div>
        </div>
        {/* Правая колонка: только сделки на рынке */}
        <div className="right-col w-[340px] min-w-[260px] flex flex-col gap-2 ml-2">
          {/* Только сделки на рынке */}
          <div className="trades-list-col">
            <TradesList />
          </div>
        </div>
      </div>
      {/* Секция заявок пользователя вынесена и изолирована */}
      <div className="max-w-[1500px] mx-auto px-4 md:px-8 lg:px-0 mt-10 mb-4">
        <UserOrdersSection />
      </div>
    </div>
  );
} 