import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import CandlestickChart from '../../components/ui/CandlestickChart';

import type { Instrument } from './TradePage';

interface TradeChartProps {
  data: any[];
  loading: boolean;
  error: string | null;
  selected: Instrument | null;
  price: number;
  change: number;
  timeframe: string;
  setTimeframe: (tf: string) => void;
}

const timeframes = ['1m','5m','15m','1h','1d'];

const TradeChart: React.FC<TradeChartProps> = ({ data, loading, error, selected, price, change, timeframe, setTimeframe }) => (
  <Card className="flex-1 p-6 flex flex-col bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border gap-4 rounded-2xl shadow-sm">
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-2">
      <div>
        <h2 className="font-semibold text-2xl text-light-fg dark:text-dark-fg">{selected ? selected.ticker : ''} / USD</h2>
        <div className="flex items-center gap-3 mt-2">
          <span className="text-xl font-bold text-light-fg dark:text-dark-fg">${price}</span>
          <span className={`text-base font-semibold ${change > 0 ? 'text-light-success dark:text-dark-accent' : change < 0 ? 'text-light-error dark:text-error' : 'text-light-fg-secondary dark:text-dark-brown'}`}>{change > 0 ? '+' : ''}{change}%</span>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-light-border/30 dark:scrollbar-thumb-dark-border/30 pb-1">
        {timeframes.map(tf => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`rounded-lg px-5 py-2 text-base font-semibold transition-all duration-150 border border-light-border dark:border-dark-border
              ${tf === timeframe
                ? 'bg-light-accent text-white dark:bg-dark-accent dark:text-dark-bg shadow-sm'
                : 'bg-transparent text-light-fg dark:text-dark-fg hover:bg-light-accent/10 dark:hover:bg-dark-accent/10'}
            `}
          >
            {tf}
          </button>
        ))}
      </div>
    </div>
    <div className="flex-1 min-h-[600px] h-[700px] w-full max-w-[1200px] mx-auto rounded-2xl overflow-hidden">
      {loading ? (
        <div className="flex items-center justify-center h-full text-light-fg-secondary dark:text-dark-brown text-sm">Загрузка графика...</div>
      ) : error ? (
        <div className="flex items-center justify-center h-full text-light-error dark:text-error text-sm">{error}</div>
      ) : (
        <CandlestickChart data={data} />
      )}
    </div>
  </Card>
);

export default TradeChart; 