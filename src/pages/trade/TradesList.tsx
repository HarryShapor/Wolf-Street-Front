import React, { useEffect, useState } from 'react';

interface Trade {
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  time: string;
}

const mockTrades: Trade[] = [
  { price: 118247.30, amount: 0.00253, side: 'sell', time: '17:10:27' },
  { price: 118247.30, amount: 0.00423, side: 'sell', time: '17:10:27' },
  { price: 118247.30, amount: 0.003, side: 'sell', time: '17:10:27' },
  { price: 118247.30, amount: 0.005, side: 'sell', time: '17:10:27' },
  { price: 118247.31, amount: 0.00422, side: 'buy', time: '17:10:27' },
  { price: 118247.31, amount: 0.003, side: 'buy', time: '17:10:27' },
  { price: 118247.31, amount: 0.0005, side: 'buy', time: '17:10:27' },
  { price: 118247.31, amount: 0.01713, side: 'buy', time: '17:10:27' },
  { price: 118247.69, amount: 0.00005, side: 'sell', time: '17:10:27' },
  { price: 118247.79, amount: 0.00765, side: 'sell', time: '17:10:27' },
  { price: 118247.99, amount: 0.00298, side: 'sell', time: '17:10:27' },
  { price: 118248.05, amount: 0.00169, side: 'sell', time: '17:10:27' },
  { price: 118248.00, amount: 0.00215, side: 'sell', time: '17:10:27' },
  { price: 118248.06, amount: 0.00015, side: 'sell', time: '17:10:27' },
  { price: 118248.86, amount: 0.00009, side: 'sell', time: '17:10:27' },
  { price: 118249.00, amount: 0.001, side: 'buy', time: '17:10:27' },
  { price: 118249.10, amount: 0.002, side: 'buy', time: '17:10:27' },
  { price: 118249.20, amount: 0.003, side: 'buy', time: '17:10:27' },
  { price: 118249.30, amount: 0.004, side: 'buy', time: '17:10:27' },
  { price: 118249.40, amount: 0.005, side: 'buy', time: '17:10:27' },
];

interface TradesListProps {
  trades?: Trade[];
}

const ROW_HEIGHT = 20;
const VISIBLE_ROWS = 10;
const GRAPH_POINTS = 32;

function genGraphData(prev: number[]): number[] {
  return prev.map((v, i) => {
    const delta = (Math.random() - 0.5) * 2;
    let next = v + delta;
    if (i === 0) next = 50 + Math.random() * 10;
    if (next < 10) next = 10;
    if (next > 90) next = 90;
    return next;
  });
}

const TradesList: React.FC<TradesListProps> = ({ trades }) => {
  const data = trades && trades.length > 0 ? trades : mockTrades;
  const [graph, setGraph] = useState<number[]>(() => Array.from({ length: GRAPH_POINTS }, (_, i) => 50 + Math.sin(i / 3) * 20 + Math.random() * 5));

  React.useEffect(() => {
    const interval = setInterval(() => {
      setGraph(prev => genGraphData(prev));
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const width = 320;
  const height = ROW_HEIGHT * VISIBLE_ROWS;
  const step = width / (GRAPH_POINTS - 1);
  const graphWithEdges = [height, ...graph.slice(1, -1).map(y => height - (y / 100) * height), height];
  const path = graphWithEdges.map((y, i) => `${i === 0 ? 'M' : 'L'}${i * step},${y}`).join(' ');
  const area = `${path} L${width},${height} L0,${height} Z`;

  return (
    <div className="w-full h-[450px] bg-light-card/90 dark:bg-dark-card/90 border border-light-border/40 dark:border-dark-border/40 rounded-2xl shadow-2xl transition-shadow hover:shadow-[0_0_48px_12px_rgba(80,255,180,0.35)] flex flex-col">
      {/* Сделки */}
      <div className="relative z-10 w-full">
        {/* SVG фон */}
        <svg
          className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none text-light-accent/20 dark:text-dark-accent/20"
          width={width}
          height={height}
        >
          <defs>
            <linearGradient id="trades-bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0.08" />
            </linearGradient>
          </defs>
          <path d={area} fill="url(#trades-bg)" />
          <path d={path} fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
        </svg>
        {/* Контент поверх */}
        <div className="relative z-10 flex flex-col">
          <div className="flex items-center px-2 pt-2 pb-1 border-b border-light-border/40 dark:border-dark-border/40 bg-light-bg/80 dark:bg-dark-bg/80 rounded-t-2xl">
            <span className="text-xs font-bold text-green-600 dark:text-green-400 flex-1 tracking-tight">Сделки на рынке</span>
          </div>
          <div className="grid grid-cols-3 gap-0 px-2 py-1 text-xs font-semibold text-light-fg-secondary dark:text-dark-brown border-b border-light-border/30 dark:border-dark-border/30 select-none tracking-tight bg-light-bg/60 dark:bg-dark-bg/60">
            <span className="text-left">Цена (USDT)</span>
            <span className="text-center">Кол-во (BTC)</span>
            <span className="text-right">Время</span>
          </div>
          <div
            className="divide-y divide-light-border/20 dark:divide-dark-border/20"
            style={{ height: `${ROW_HEIGHT * VISIBLE_ROWS}px`, overflowY: 'hidden' }}
          >
            {data.slice(0, VISIBLE_ROWS).map((t, i) => (
              <div
                key={i}
                style={{ height: `${ROW_HEIGHT}px` }}
                className={
                  `grid grid-cols-3 gap-0 px-2 py-0 text-xs leading-[1.1] items-center transition-colors duration-100
                  hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 cursor-pointer tracking-tight`
                }
              >
                <span className={`text-left font-bold ${t.side === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>{t.price.toLocaleString('ru-RU', { minimumFractionDigits: 2 })}</span>
                <span className="text-center text-light-fg dark:text-dark-fg font-mono">{t.amount}</span>
                <span className="text-right text-light-fg-secondary dark:text-dark-brown font-mono">{t.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradesList; 