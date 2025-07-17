import React from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface TradeFormProps {
  selected: { symbol: string; name: string };
  amount: string;
  setAmount: (v: string) => void;
  side: 'buy' | 'sell';
  setSide: (v: 'buy' | 'sell') => void;
  orderType: 'limit' | 'market';
  setOrderType: (v: 'limit' | 'market') => void;
  price: number;
  total: string;
  balance: number;
  handleAllClick: () => void;
  handleTrade: (e: React.FormEvent) => void;
}

const TradeForm: React.FC<TradeFormProps> = ({ selected, amount, setAmount, side, setSide, orderType, setOrderType, price, total, balance, handleAllClick, handleTrade }) => (
  <div className="mt-2">
    <Card className="w-full p-6 bg-light-card/90 dark:bg-dark-card/90 border border-light-border/40 dark:border-dark-border/40 flex flex-col gap-4 rounded-2xl shadow-2xl transition-shadow hover:shadow-[0_0_48px_12px_rgba(80,255,180,0.35)]">
      <form onSubmit={handleTrade} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
        <div className="md:col-span-2">
          <label className="text-xs text-light-fg-secondary dark:text-dark-brown font-medium mb-1 block">Инструмент</label>
          <div className="relative">
            <select
              value={selected.symbol}
              onChange={e => {}}
              className="w-full appearance-none px-3 py-1.5 pr-8 rounded-lg border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent outline-none text-sm transition-all duration-150 hover:bg-light-accent/5 dark:hover:bg-dark-accent/10 cursor-pointer"
              disabled
            >
              <option value={selected.symbol}>{selected.symbol} — {selected.name}</option>
            </select>
            <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-light-fg-secondary dark:text-dark-brown text-xs">▼</span>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            className={`rounded-lg py-1.5 text-sm font-semibold transition-all duration-150 w-full
              ${side === 'buy' ? 'bg-light-success text-white dark:bg-dark-accent dark:text-dark-bg shadow-sm' : 'bg-transparent text-light-fg dark:text-dark-fg border border-light-border dark:border-dark-border hover:bg-light-success/10 dark:hover:bg-dark-accent/10'}`}
            onClick={() => setSide('buy')}
          >Купить</button>
          <button
            type="button"
            className={`rounded-lg py-1.5 text-sm font-semibold transition-all duration-150 w-full
              ${side === 'sell' ? 'bg-light-error text-white dark:bg-error dark:text-dark-bg shadow-sm' : 'bg-transparent text-light-fg dark:text-dark-fg border border-light-border dark:border-dark-border hover:bg-light-error/10 dark:hover:bg-error/10'}`}
            onClick={() => setSide('sell')}
          >Продать</button>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-xs font-medium border transition-all duration-150
              ${orderType === 'limit' ? 'bg-light-accent text-white dark:bg-dark-accent dark:text-dark-bg border-light-accent dark:border-dark-accent' : 'bg-transparent text-light-fg dark:text-dark-fg border-light-border dark:border-dark-border hover:bg-light-accent/10 dark:hover:bg-dark-accent/10'}`}
            onClick={() => setOrderType('limit')}
          >Лимит</button>
          <button
            type="button"
            className={`rounded-lg px-3 py-1 text-xs font-medium border transition-all duration-150
              ${orderType === 'market' ? 'bg-light-accent text-white dark:bg-dark-accent dark:text-dark-bg border-light-accent dark:border-dark-accent' : 'bg-transparent text-light-fg dark:text-dark-fg border-light-border dark:border-dark-border hover:bg-light-accent/10 dark:hover:bg-dark-accent/10'}`}
            onClick={() => setOrderType('market')}
          >Рынок</button>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-light-fg-secondary dark:text-dark-brown font-medium mb-1">Цена</label>
          <div className="flex items-center gap-1 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg px-2 py-1">
            <input
              type="number"
              min="0"
              step="any"
              value={price}
              readOnly
              className="flex-1 bg-transparent text-sm font-semibold text-light-fg dark:text-dark-fg outline-none border-none"
            />
            <span className="text-light-fg-secondary dark:text-dark-brown text-xs">USD</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-light-fg-secondary dark:text-dark-brown font-medium mb-1">Количество</label>
          <div className="flex items-center gap-1 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg px-2 py-1">
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Введите количество"
              className="flex-1 bg-transparent text-sm font-semibold text-light-fg dark:text-dark-fg outline-none border-none"
            />
            <span className="text-light-fg-secondary dark:text-dark-brown text-xs">{selected.symbol}</span>
            <button type="button" className="rounded px-1 py-0.5 text-xs font-medium text-light-accent dark:text-dark-accent hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors" onClick={handleAllClick}>Всё</button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-light-fg-secondary dark:text-dark-brown font-medium mb-1">Итого</label>
          <div className="flex items-center gap-1 px-2 py-1">
            <span className="font-bold text-sm text-light-fg dark:text-dark-fg">{total ? `$${total}` : '-'}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-light-fg-secondary dark:text-dark-brown font-medium mb-1">Баланс</label>
          <div className="flex items-center gap-1 px-2 py-1">
            <span className="font-semibold text-light-fg dark:text-dark-fg text-xs">${balance}</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-light-fg-secondary dark:text-dark-brown font-medium mb-1">Комиссия</label>
          <div className="flex items-center gap-1 px-2 py-1">
            <span className="text-xs text-light-fg-secondary dark:text-dark-brown">0.1%</span>
          </div>
        </div>
        <div className="md:col-span-4">
          <button
            type="submit"
            className={`rounded-lg text-base font-bold py-2 mt-2 w-full transition-all duration-150
              ${side === 'buy' ? 'bg-light-success text-white dark:bg-dark-accent dark:text-dark-bg' : 'bg-light-error text-white dark:bg-error dark:text-dark-bg'}
            `}
          >{side === 'buy' ? 'Купить' : 'Продать'} {selected.symbol}</button>
        </div>
      </form>
    </Card>
  </div>
);

export default TradeForm; 