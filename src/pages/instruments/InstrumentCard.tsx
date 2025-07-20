import React from "react";
import Card from "../../components/ui/Card";

interface InstrumentCardProps {
  title: string;
  ticker: string;
  icon?: string;
  price?: number | null;
  visible: boolean;
  index: number;
  fullHeight?: boolean;
  loadingIcon?: boolean;
  profitability?: number | null;
  loadingProfit?: boolean;
}

export default function InstrumentCard({ title, ticker, icon, price, visible, index, fullHeight, loadingIcon, profitability, loadingProfit }: InstrumentCardProps) {
  const isLeft = index % 2 === 0;
  return (
    <div
      className={`gap-2 hover:scale-[1.03] transition-transform duration-700 ease-in-out ${visible ? 'opacity-100 translate-x-0' : isLeft ? '-translate-x-16 opacity-0' : 'translate-x-16 opacity-0'} transform ${fullHeight ? 'h-full flex-1' : ''}`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <Card
        icon={loadingIcon ? (
          <div className="w-8 h-8 rounded-full bg-white border border-light-border dark:border-dark-border flex items-center justify-center animate-pulse">...</div>
        ) : icon ? (
          <img src={icon} alt={ticker} className="w-8 h-8 rounded-full bg-white border border-light-border dark:border-dark-border shadow-sm" />
        ) : (
          <div className="w-8 h-8 rounded-full bg-white border border-light-border dark:border-dark-border flex items-center justify-center text-xs opacity-50">?</div>
        )}
        title={<span className="text-2xl font-bold text-light-accent dark:text-dark-accent">{ticker}</span>}
        className={`gap-2 ${fullHeight ? 'h-full flex-1 flex flex-col' : ''}`}
      >
        <div className="text-lg font-semibold mb-2">{title}</div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs font-medium opacity-60">Текущая цена:</span>
          <span className="text-base font-bold">{price !== undefined && price !== null ? price : '—'}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs font-medium opacity-60">Доходность (1д):</span>
          {loadingProfit ? (
            <span className="text-xs text-light-fg/60 dark:text-dark-brown/70">...</span>
          ) : profitability !== null && profitability !== undefined ? (
            <span className={`font-semibold text-xs ${profitability > 0 ? 'text-green-600 dark:text-green-400' : profitability < 0 ? 'text-red-500 dark:text-red-400' : 'text-light-fg/60 dark:text-dark-brown/70'}`}>
              {(profitability * 100 > 0 ? '+' : '') + (profitability * 100).toFixed(2)}%
            </span>
          ) : (
            <span className="text-xs text-light-fg/60 dark:text-dark-brown/70">—</span>
          )}
        </div>
      </Card>
    </div>
  );
} 