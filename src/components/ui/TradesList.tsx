import React from 'react';
import Card from './Card';

interface Trade {
  price: number;
  amount: number;
  side: 'buy' | 'sell';
  time: string;
}

interface TradesListProps {
  trades: Trade[];
}

const TradesList: React.FC<TradesListProps> = ({ trades }) => (
  <Card className="flex-1 p-6 flex flex-col bg-light-card dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl shadow-sm">
    <h3 className="font-semibold mb-6 text-light-fg dark:text-dark-fg text-xl tracking-wide">Сделки</h3>
    <div className="flex flex-col gap-4">
      {trades.map((t, i) => (
        <div
          key={i}
          className={`flex items-center justify-between gap-8 px-5 py-3 rounded-xl border transition-all duration-200
            ${t.side === 'buy'
              ? 'border-light-success dark:border-dark-accent bg-light-success/10 dark:bg-dark-accent/10'
              : 'border-light-error dark:border-error bg-light-error/10 dark:bg-error/10'}
            hover:scale-[1.03] hover:shadow-md hover:z-20 relative group`}
        >
          {/* Левая часть: иконка + цена + объём */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Иконка стрелки */}
            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full shadow-sm ${t.side === 'buy' ? 'bg-light-success/80 dark:bg-dark-accent/80' : 'bg-light-error/80 dark:bg-error/80'}`}>
              {t.side === 'buy' ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 16 16"><path d="M8 13V3M8 3L4 7M8 3l4 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 16 16"><path d="M8 3v10M8 13l4-4M8 13l-4-4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
            </span>
            <span className={`font-extrabold text-xl ${t.side === 'buy' ? 'text-light-success dark:text-dark-accent' : 'text-light-error dark:text-error'} drop-shadow`}>{t.price}</span>
            <span className="text-sm text-light-fg-secondary dark:text-dark-brown ml-4">Объём: <span className="font-semibold">{t.amount}</span></span>
          </div>
          {/* Правая часть: бейдж BUY/SELL + время */}
          <div className="flex flex-col items-end min-w-[70px]">
            <span className={`inline-flex items-center gap-2 px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm
              ${t.side === 'buy' ? 'bg-light-success/90 text-white dark:bg-dark-accent/90' : 'bg-light-error/90 text-white dark:bg-error/90'}`}
            >
              {t.side === 'buy' ? (
                <svg width="14" height="14" fill="none" viewBox="0 0 16 16" className="inline-block"><path d="M8 13V3M8 3L4 7M8 3l4 4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              ) : (
                <svg width="14" height="14" fill="none" viewBox="0 0 16 16" className="inline-block"><path d="M8 3v10M8 13l4-4M8 13l-4-4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              )}
              {t.side}
            </span>
            <span className="text-xs text-light-fg-secondary dark:text-dark-brown mt-3">{t.time}</span>
          </div>
        </div>
      ))}
    </div>
  </Card>
);

export default TradesList; 