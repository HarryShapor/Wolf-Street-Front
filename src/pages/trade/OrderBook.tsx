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

  // Показываем только visibleRows заявок сверху и снизу от центра стакана
  const sellRows = orderBookSell.slice(-visibleRows);
  const buyRows = orderBookBuy.slice(0, visibleRows);

  return (
    <div ref={containerRef} className="flex-1 h-full overflow-hidden rounded-2xl group transition-colors duration-200 border border-light-border/40 dark:border-dark-border/40 group-hover:border-light-accent/40 dark:group-hover:border-dark-accent/40 shadow-2xl transition-shadow hover:shadow-[0_0_32px_0_rgba(80,255,180,0.45)]">
      <Card className="p-4 flex flex-col bg-light-card dark:bg-dark-card rounded-2xl shadow-inner h-full">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-extrabold text-light-fg dark:text-dark-fg text-base tracking-wide text-center flex-1">Биржевой стакан</h3>
          </div>
          <div className="flex-1 flex flex-col gap-1 h-80">
            <div className="flex-1 flex flex-col-reverse gap-1">
              {/* Sell Orders (Ask) — сверху */}
              {sellRows.length > 0 ? sellRows.map((o, i) => (
                <div
                  key={i}
                  className="flex items-center group relative cursor-pointer min-h-[20px] rounded-lg transition-all duration-150 hover:bg-light-error/10 dark:hover:bg-dark-accent/10 px-2"
                  style={{
                    background: `linear-gradient(to left, rgba(255,92,138,${o.amount / Math.max(...sellRows.map(o => o.amount), 1) / 2}), transparent)`
                  }}
                >
                  <span className="flex-1 text-xs text-right text-light-error dark:text-error pr-2">{o.amount}</span>
                  <span className="w-20 text-right font-bold text-light-error dark:text-error group-hover:underline text-sm pr-1">{o.price}</span>
                </div>
              )) : <div className="text-center text-xs text-light-fg-secondary dark:text-dark-brown py-4">Нет заявок</div>}
            </div>
            {/* Центр стакана: bestBid, midPrice, bestAsk */}
            <div className="flex flex-col items-center my-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-light-success dark:text-dark-accent">
                  {bestBid ? bestBid.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : '—'}
                </span>
                <span className="text-light-fg-secondary dark:text-dark-brown text-base">↑</span>
                <span className="text-base text-light-fg-secondary dark:text-dark-brown">
                  {midPrice ? midPrice.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : '—'}
                </span>
              </div>
              <div className="text-xl font-bold text-light-error dark:text-error mt-1">
                {bestAsk ? bestAsk.toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : '—'}
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-1">
              {/* Buy Orders (Bid) — снизу */}
              {buyRows.length > 0 ? buyRows.map((o, i) => (
                <div
                  key={i}
                  className="flex items-center group relative cursor-pointer min-h-[20px] rounded-lg transition-all duration-150 hover:bg-light-success/10 dark:hover:bg-dark-accent/10 px-2"
                  style={{
                    background: `linear-gradient(to left, rgba(62,207,142,${o.amount / Math.max(...buyRows.map(o => o.amount), 1) / 2}), transparent)`
                  }}
                >
                  <span className="flex-1 text-xs text-right text-light-success dark:text-dark-accent pr-2">{o.amount}</span>
                  <span className="w-20 text-right font-bold text-light-success dark:text-dark-accent group-hover:underline text-sm pr-1">{o.price}</span>
                </div>
              )) : <div className="text-center text-xs text-light-fg-secondary dark:text-dark-brown py-4">Нет заявок</div>}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderBook; 