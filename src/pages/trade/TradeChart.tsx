import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import CandlestickChart from '../../components/ui/CandlestickChart';

import type { Instrument } from '../../hooks/useInstruments';

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

const mockCandles = [
  { time: 1722427200, open: 100, high: 110, low: 95, close: 105 }, // 2024-07-01T12:00:00Z
  { time: 1722513600, open: 105, high: 115, low: 100, close: 110 }, // 2024-07-02T12:00:00Z
  { time: 1722600000, open: 110, high: 120, low: 108, close: 115 }, // 2024-07-03T12:00:00Z
  { time: 1722686400, open: 115, high: 118, low: 112, close: 113 }, // 2024-07-04T12:00:00Z
  { time: 1722772800, open: 113, high: 117, low: 110, close: 111 }, // 2024-07-05T12:00:00Z
  { time: 1722859200, open: 111, high: 112, low: 105, close: 108 }, // 2024-07-06T12:00:00Z
  { time: 1722945600, open: 108, high: 115, low: 107, close: 114 }, // 2024-07-07T12:00:00Z
  { time: 1723032000, open: 114, high: 120, low: 113, close: 119 }, // 2024-07-08T12:00:00Z
  { time: 1723118400, open: 119, high: 125, low: 118, close: 120 }, // 2024-07-09T12:00:00Z
  { time: 1723204800, open: 120, high: 123, low: 117, close: 118 }, // 2024-07-10T12:00:00Z
  { time: 1723291200, open: 118, high: 124, low: 116, close: 122 }, // 2024-07-11T12:00:00Z
  { time: 1723377600, open: 122, high: 128, low: 121, close: 127 }, // 2024-07-12T12:00:00Z
  { time: 1723464000, open: 127, high: 130, low: 125, close: 129 }, // 2024-07-13T12:00:00Z
  { time: 1723550400, open: 129, high: 132, low: 128, close: 130 }, // 2024-07-14T12:00:00Z
  { time: 1723636800, open: 130, high: 135, low: 129, close: 134 }, // 2024-07-15T12:00:00Z
  { time: 1723723200, open: 134, high: 138, low: 133, close: 137 }, // 2024-07-16T12:00:00Z
  { time: 1723809600, open: 137, high: 140, low: 135, close: 139 }, // 2024-07-17T12:00:00Z
  { time: 1723896000, open: 139, high: 142, low: 137, close: 141 }, // 2024-07-18T12:00:00Z
  { time: 1723982400, open: 141, high: 145, low: 140, close: 144 }, // 2024-07-19T12:00:00Z
  { time: 1724068800, open: 144, high: 148, low: 143, close: 147 }, // 2024-07-20T12:00:00Z
  { time: 1724241600, open: 149, high: 153, low: 148, close: 152 }, // 2024-07-22T12:00:00Z
  { time: 1724328000, open: 152, high: 155, low: 150, close: 154 }, // 2024-07-23T12:00:00Z
  { time: 1724414400, open: 154, high: 158, low: 153, close: 157 }, // 2024-07-24T12:00:00Z
  { time: 1724500800, open: 157, high: 160, low: 155, close: 159 }, // 2024-07-25T12:00:00Z
  { time: 1724587200, open: 159, high: 163, low: 158, close: 162 }, // 2024-07-26T12:00:00Z
  { time: 1724673600, open: 162, high: 165, low: 160, close: 164 }, // 2024-07-27T12:00:00Z
  { time: 1724760000, open: 164, high: 168, low: 163, close: 167 }, // 2024-07-28T12:00:00Z
  { time: 1724846400, open: 167, high: 170, low: 165, close: 169 }, // 2024-07-29T12:00:00Z
  { time: 1724932800, open: 169, high: 173, low: 168, close: 172 }, // 2024-07-30T12:00:00Z
];

const TradeChart: React.FC<TradeChartProps> = ({ data, loading, error, selected, price, change, timeframe, setTimeframe }) => (
  <Card className="flex-1 p-0 flex flex-col bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border gap-1 rounded-2xl shadow-sm">
    <div className="flex flex-row items-start justify-between px-6 pt-2 pb-0.5">
      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline gap-2">
          <h2 className="font-semibold text-2xl text-light-fg dark:text-dark-fg leading-tight">{selected ? selected.ticker : ''} / USD</h2>
          <span className="text-xl font-bold text-light-fg dark:text-dark-fg leading-tight">${price}</span>
          <span className={`text-base font-semibold leading-tight ${change > 0 ? 'text-light-success dark:text-dark-accent' : change < 0 ? 'text-light-error dark:text-error' : 'text-light-fg-secondary dark:text-dark-brown'}`}>{change > 0 ? '+' : ''}{change}%</span>
        </div>
      </div>
      <div className="flex gap-1 items-start mt-0.5 overflow-x-auto scrollbar-thin scrollbar-thumb-light-border/30 dark:scrollbar-thumb-dark-border/30">
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
    <div className="flex-1 w-full mx-auto rounded-2xl overflow-hidden" style={{width: '100%', maxWidth: '100%', height: '60vh', minHeight: 400, minWidth: 320, margin: '0 auto', background: 'none', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'}}>
      {/* Используем мок-данные для теста графика */}
      <CandlestickChart data={mockCandles} />
    </div>
  </Card>
);

export default TradeChart; 