import React, { useState, useEffect } from 'react';
import CandlestickChart from '../../components/ui/CandlestickChart';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Header from '../../components/header/Header';
import CustomSelect from '../../components/ui/CustomSelect';
import OrderBook from '../../components/ui/OrderBook';
import TradeChart from '../../components/ui/TradeChart';
import TradeForm from '../../components/ui/TradeForm';
import TradesList from '../../components/ui/TradesList';
import InstrumentSelector from '../../components/ui/InstrumentSelector';

const mockInstruments = [
  { symbol: 'BTC', name: 'Bitcoin', price: 65000, change: 2.1 },
  { symbol: 'ETH', name: 'Ethereum', price: 3500, change: -1.2 },
  { symbol: 'TON', name: 'Toncoin', price: 7, change: 0.5 },
  { symbol: 'USDT', name: 'Tether', price: 1, change: 0.0 },
];

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
    fetch(`http://89.169.183.192:8080/market-data-service/api/v1/orderbook/${instrumentId}?limitOrders=${limit}`)
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
    fetch(`http://89.169.183.192:8080/market-data-service/api/v1/ohlc/${instrumentId}?interval=${interval}&from=${fromISO}&to=${toISO}`)
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

export default function TradePage() {
  const [selected, setSelected] = useState(mockInstruments[0]);
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState<'buy'|'sell'>('buy');
  const [search, setSearch] = useState('');
  const [timeframe, setTimeframe] = useState('1h');
  const [positions, setPositions] = useState(initialPositions);
  const [balance] = useState(mockBalance);
  const [orderType, setOrderType] = useState<'limit'|'market'>('limit');

  const filtered = mockInstruments.filter(inst =>
    inst.symbol.toLowerCase().includes(search.toLowerCase()) ||
    inst.name.toLowerCase().includes(search.toLowerCase())
  );

  const price = selected.price;
  const change = selected.change;
  const total = amount ? (parseFloat(amount) * price).toFixed(2) : '';

  // Для примера: сопоставим symbol -> instrumentId (BTC=1, ETH=4, TON=5, USDT=6)
  const symbolToId: Record<string, number> = { BTC: 1, ETH: 4, TON: 5, USDT: 6 };
  const instrumentId = symbolToId[selected.symbol] || 1;
  // Используем instrumentId для стакана и графика
  const { sell: orderBookSell, buy: orderBookBuy, loading: loadingOrderBook, error: errorOrderBook } = useOrderBook(instrumentId, 8);
  const { data: ohlcData, loading: loadingOhlc, error: errorOhlc } = useOhlcData(instrumentId, timeframe, 12);

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
    setAmount((balance / price).toFixed(6));
  }

  function handleTrade(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    setPositions(prev => [
      ...prev,
      {
        symbol: selected.symbol,
        amount: Number(amount),
        entry: price,
        pnl: 0,
      },
    ]);
    setAmount('');
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Header {...headerProps} />
      <div className="pt-28 flex flex-row w-full max-w-[1300px] mx-auto gap-8 items-start px-4 md:px-8 lg:px-0">
        {/* Левая колонка: селектор инструмента + ордербук */}
        <div className="w-[18%] min-w-[210px] flex flex-col">
          <InstrumentSelector
            value={selected.symbol}
            onChange={symbol => {
              const found = mockInstruments.find(inst => inst.symbol === symbol);
              if (found) setSelected(found);
            }}
            options={mockInstruments}
          />
          <OrderBook
            price={price}
            orderBookSell={orderBookSell}
            orderBookBuy={orderBookBuy}
            loadingOrderBook={loadingOrderBook}
            errorOrderBook={errorOrderBook}
          />
        </div>
        {/* Центр: график + форма */}
        <div className="flex-1 flex flex-col h-[560px] min-w-[0] gap-4">
          <TradeChart
            data={ohlcData}
            loading={loadingOhlc}
            error={errorOhlc}
            selected={selected}
            price={price}
            change={change}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
          />
          <TradeForm
            selected={selected}
            amount={amount}
            setAmount={setAmount}
            side={side}
            setSide={setSide}
            orderType={orderType}
            setOrderType={setOrderType}
            price={price}
            total={total}
            balance={balance}
            handleAllClick={handleAllClick}
            handleTrade={handleTrade}
          />
        </div>
        {/* Правая колонка: сделки */}
        <div className="w-[22%] min-w-[250px] flex flex-col">
          <TradesList trades={mockTrades.map(t => ({ ...t, side: t.side as 'buy' | 'sell' }))} />
        </div>
      </div>
    </div>
  );
} 