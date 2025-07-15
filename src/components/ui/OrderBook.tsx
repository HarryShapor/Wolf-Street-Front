import React from 'react';
import Card from './Card';

interface OrderBookProps {
  price: number;
  orderBookSell: { price: number; amount: number }[];
  orderBookBuy: { price: number; amount: number }[];
  loadingOrderBook: boolean;
  errorOrderBook: string | null;
}

const OrderBook: React.FC<OrderBookProps> = ({ price, orderBookSell, orderBookBuy, loadingOrderBook, errorOrderBook }) => {
  return (
    <div className="flex-1 mb-6 overflow-hidden rounded-2xl group transition-colors duration-200 border border-light-border/40 dark:border-dark-border/40 group-hover:border-light-accent/40 dark:group-hover:border-dark-accent/40" style={{boxShadow: 'inset 0 6px 32px 0 rgba(0,0,0,0.22), inset 0 -2px 8px 0 rgba(0,0,0,0.18)'}}>
      <Card className="p-4 flex flex-col bg-light-card dark:bg-dark-card rounded-2xl shadow-inner h-full">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="font-extrabold text-light-fg dark:text-dark-fg text-base tracking-wide text-center flex-1">Биржевой стакан</h3>
          </div>
          <div className="flex-1 flex flex-col gap-1 max-h-80 min-h-80">
            <div className="flex-1 flex flex-col-reverse overflow-y-auto gap-1">
              {/* Sell Orders (Ask) — сверху */}
              {(() => {
                const maxRows = 10;
                const maxSell = Math.max(...orderBookSell.map(o => o.amount), 1);
                const sellRows = orderBookSell.slice(-maxRows);
                return sellRows.length > 0 ? sellRows.map((o, i) => (
                  <div
                    key={i}
                    className="flex items-center group relative cursor-pointer min-h-[20px] rounded-lg transition-all duration-150 hover:bg-light-error/10 dark:hover:bg-dark-accent/10 px-2"
                    style={{
                      background: `linear-gradient(to left, rgba(255,92,138,${o.amount / maxSell / 2}), transparent)`
                    }}
                  >
                    <span className="flex-1 text-xs text-right text-light-error dark:text-error pr-2">{o.amount}</span>
                    <span className="w-20 text-right font-bold text-light-error dark:text-error group-hover:underline text-sm pr-1">{o.price}</span>
                  </div>
                )) : <div className="text-center text-xs text-light-fg-secondary dark:text-dark-brown py-4">Нет заявок</div>;
              })()}
            </div>
            {/* Текущая цена */}
            <div className="flex items-center justify-center py-1 border-y border-light-border/40 dark:border-dark-border/40 sticky top-0 z-10 bg-transparent">
              <span className="font-semibold text-base text-light-fg dark:text-dark-fg tracking-wider">{price}</span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto gap-1">
              {/* Buy Orders (Bid) — снизу */}
              {(() => {
                const maxRows = 10;
                const maxBuy = Math.max(...orderBookBuy.map(o => o.amount), 1);
                const buyRows = orderBookBuy.slice(0, maxRows);
                return buyRows.length > 0 ? buyRows.map((o, i) => (
                  <div
                    key={i}
                    className="flex items-center group relative cursor-pointer min-h-[20px] rounded-lg transition-all duration-150 hover:bg-light-success/10 dark:hover:bg-dark-accent/10 px-2"
                    style={{
                      background: `linear-gradient(to left, rgba(62,207,142,${o.amount / maxBuy / 2}), transparent)`
                    }}
                  >
                    <span className="flex-1 text-xs text-right text-light-success dark:text-dark-accent pr-2">{o.amount}</span>
                    <span className="w-20 text-right font-bold text-light-success dark:text-dark-accent group-hover:underline text-sm pr-1">{o.price}</span>
                  </div>
                )) : <div className="text-center text-xs text-light-fg-secondary dark:text-dark-brown py-4">Нет заявок</div>;
              })()}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default OrderBook; 