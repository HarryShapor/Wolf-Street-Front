import React, { useRef, useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import { useOrderbookSpread } from '../../hooks/useOrderbookSpread';

interface OrderBookProps {
  price: number;
  orderBookSell: { price: number; amount: number }[];
  orderBookBuy: { price: number; amount: number }[];
  loadingOrderBook: boolean;
  errorOrderBook: string | null;
  instrumentId?: number | string;
}

const ROW_HEIGHT = 28; // px, подбери под свой дизайн

const OrderBook: React.FC<OrderBookProps> = ({ price, orderBookSell, orderBookBuy, loadingOrderBook, errorOrderBook, instrumentId }) => {
  const { midPrice, bestBid, bestAsk, loading } = useOrderbookSpread(instrumentId);
  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleRows, setVisibleRows] = useState(10);

  useEffect(() => {
    function updateRows() {
      if (!containerRef.current) return;
      const height = containerRef.current.offsetHeight;
      setVisibleRows(Math.max(2, Math.floor(height / ROW_HEIGHT)));
    }
    updateRows();
    window.addEventListener('resize', updateRows);
    return () => window.removeEventListener('resize', updateRows);
  }, []);

  // Показываем стакан: сверху flex-1 asks, по центру spread, снизу flex-1 bids
  const asks = [...orderBookSell].reverse();
  const bids = orderBookBuy;

  // Для визуализации: ищем максимальный объём среди всех заявок
  const maxAskVolume = Math.max(...asks.map(o => o.price * o.amount), 1);
  const maxBidVolume = Math.max(...bids.map(o => o.price * o.amount), 1);

  return (
    <div ref={containerRef} className="flex-1 h-full overflow-hidden rounded-2xl group transition-colors duration-200 border border-light-border/40 dark:border-dark-border/40 group-hover:border-light-accent/40 dark:group-hover:border-dark-accent/40 shadow-2xl transition-shadow hover:shadow-[0_0_32px_0_rgba(80,255,180,0.45)]">
      <Card className="p-4 flex flex-col bg-light-card dark:bg-dark-card rounded-2xl shadow-inner h-full">
        <div className="relative z-10">
          <div className="flex flex-col gap-0 mb-0">
            <h3 className="font-extrabold text-light-fg dark:text-dark-fg text-base tracking-wide text-center flex-1 mb-0 mt-0 leading-tight">Биржевой стакан</h3>
            <div className="flex flex-row items-center px-2 pb-0 pt-0 select-none mt-0">
              <span className="w-20 text-right font-medium text-light-fg/80 dark:text-dark-fg/80 text-[10px]">Цена</span>
              <span className="w-20 text-right font-medium text-light-fg/80 dark:text-dark-fg/80 text-[10px]">Кол-во</span>
              <span className="w-24 text-right font-medium text-light-fg/80 dark:text-dark-fg/80 text-[10px]">Сумма</span>
            </div>
          </div>
          <div className="flex flex-col h-80 w-full text-xs font-mono">
            {/* Заголовки */}
            {/* ASK (sell) — сверху */}
            <div className="flex-1 flex flex-col-reverse gap-0.5 relative">
              {asks.map((o, i) => (
                <div key={i} className="relative flex items-center group min-h-[20px] rounded-lg overflow-hidden">
                  {/* Bar визуализации */}
                  <div
                    className="absolute left-0 top-0 h-full z-0 rounded-lg"
                    style={{
                      width: `${Math.max(8, ((o.price * o.amount) / maxAskVolume) * 100)}%`,
                      background: 'linear-gradient(90deg, rgba(255,92,138,0.18) 0%, rgba(255,92,138,0.32) 100%)',
                    }}
                  />
                  <span className="w-20 text-right font-bold text-light-error dark:text-error pr-2 z-10 relative">{o.price}</span>
                  <span className="w-20 text-right text-light-fg dark:text-dark-fg pr-2 z-10 relative">{o.amount}</span>
                  <span className="w-24 text-right text-light-fg dark:text-dark-fg pr-2 z-10 relative">{(o.price * o.amount).toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
            {/* SPREAD (mid price) — по центру */}
            <div className="flex flex-row items-center justify-between px-2 py-1 min-h-[28px] bg-light-bg/80 dark:bg-dark-bg/80 rounded font-extrabold text-[16px] text-light-accent dark:text-dark-accent border-y border-light-border/30 dark:border-dark-border/30 my-1">
              <span className="w-20 text-right">{midPrice ? midPrice.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : '—'}</span>
              <span className="w-20 text-right text-light-fg/70 dark:text-dark-fg/70 text-xs">SPREAD</span>
              <span className="w-24" />
            </div>
            {/* BID (buy) — снизу */}
            <div className="flex-1 flex flex-col gap-0.5 relative">
              {bids.map((o, i) => (
                <div key={i} className="relative flex items-center group min-h-[20px] rounded-lg overflow-hidden">
                  {/* Bar визуализации */}
                  <div
                    className="absolute left-0 top-0 h-full z-0 rounded-lg"
                    style={{
                      width: `${Math.max(8, ((o.price * o.amount) / maxBidVolume) * 100)}%`,
                      background: 'linear-gradient(90deg, rgba(62,207,142,0.18) 0%, rgba(62,207,142,0.32) 100%)',
                    }}
                  />
                  <span className="w-20 text-right font-bold text-light-success dark:text-dark-accent pr-2 z-10 relative">{o.price}</span>
                  <span className="w-20 text-right text-light-fg dark:text-dark-fg pr-2 z-10 relative">{o.amount}</span>
                  <span className="w-24 text-right text-light-fg dark:text-dark-fg pr-2 z-10 relative">{(o.price * o.amount).toLocaleString('ru-RU', { maximumFractionDigits: 2 })}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderBook; 