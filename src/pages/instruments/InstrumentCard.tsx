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
}

export default function InstrumentCard({ title, ticker, icon, price, visible, index, fullHeight, loadingIcon }: InstrumentCardProps) {
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
      </Card>
    </div>
  );
} 