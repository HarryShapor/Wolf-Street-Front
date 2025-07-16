import React, { useState } from 'react';
import CustomSelect from '../../components/ui/CustomSelect';
import ToastModal from './ToastModal';
import { API_HOST } from '../../services/Api';
import { useInstruments } from '../../hooks/useInstruments';
import type { Instrument } from '../../hooks/useInstruments';

const tabStyles = (active: boolean, buy: boolean, first: boolean, last: boolean) =>
  `flex-1 text-center py-2 text-sm font-bold transition-colors duration-150 cursor-pointer
   ${first ? 'rounded-tl-xl' : ''} ${last ? 'rounded-tr-xl' : ''}
   ${active ? (
     buy
       ? 'bg-light-success/20 text-light-success dark:bg-dark-accent/20 dark:text-dark-accent'
       : 'bg-[#e0a6a6]/40 text-[#7a3a3a] dark:bg-[#6d2323]/40 dark:text-[#e0a6a6]'
   )
   : 'bg-transparent text-light-fg dark:text-dark-fg hover:bg-light-accent/10 dark:hover:bg-dark-accent/10'}
   border-b-2 border-b-transparent ${active ? (buy ? 'border-b-light-success dark:border-b-dark-accent' : 'border-b-[#e0a6a6] dark:border-b-[#6d2323]') : ''}
   -mr-px`;

const orderTabStyles = (active: boolean) =>
  `flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-colors duration-150 cursor-pointer border
   ${active ? 'bg-light-accent text-white dark:bg-dark-accent dark:text-dark-bg border-light-accent dark:border-dark-accent' :
    'bg-transparent text-light-fg dark:text-dark-fg border-light-border dark:border-dark-border hover:bg-light-accent/10 dark:hover:bg-dark-accent/10'}`;

const TradeFormWithTabs: React.FC = () => {
  const { instruments, loading, error } = useInstruments();
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [instrument, setInstrument] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState(65000);
  const [toastOpen, setToastOpen] = useState(false);

  React.useEffect(() => {
    if (instruments.length && !instrument) {
      setInstrument(instruments[0].ticker);
    }
  }, [instruments, instrument]);

  // Итоговая сумма
  const total = amount ? (parseFloat(amount) * price).toFixed(2) : '';
  // Комиссия
  const fee = total ? ((parseFloat(total) * 0.1) / 100).toFixed(2) : '0.00';

  function handleAllClick() {
    setAmount((10000 / price).toFixed(6));
  }

  function handleInstrumentChange(val: string) {
    setInstrument(val);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: интеграция с API
    try {
      const res = await fetch(`${API_HOST}/order-service/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          portfolioId: 1, // TODO: заменить на реальный id портфеля пользователя
          lotPrice: price,
          instrumentId: 1, // TODO: заменить на реальный id инструмента
          count: Number(amount),
          type: tab === 'buy' ? 'BUY' : 'SELL',
        })
      });
      if (res.status === 401) throw new Error('Пользователь не авторизован!');
      if (!res.ok) throw new Error('Ошибка создания заявки');
      setAmount('');
      setToastOpen(true);
    } catch (err: any) {
      alert(err.message || 'Ошибка создания заявки');
    }
  }

  return (
    <>
      <div className="w-full min-w-[340px] max-w-xl mx-auto mt-1 bg-light-card dark:bg-dark-card border border-light-border/60 dark:border-dark-border/60 rounded-2xl shadow-sm">
        {/* Вкладки Buy/Sell */}
        <div className="flex border-b border-light-border/40 dark:border-dark-border/40">
          <button className={tabStyles(tab === 'buy', true, true, false)} style={{marginRight: '-1px'}} onClick={() => setTab('buy')}>Купить</button>
          <button className={tabStyles(tab === 'sell', false, false, true)} onClick={() => setTab('sell')}>Продать</button>
        </div>
        {/* Вкладки Лимит/Рынок */}
        <div className="flex gap-1 px-3 pt-1 pb-0.5">
          <button className={orderTabStyles(orderType === 'limit')} onClick={() => setOrderType('limit')}>Лимит</button>
          <button className={orderTabStyles(orderType === 'market')} onClick={() => setOrderType('market')}>Рынок</button>
        </div>
        {/* Форма */}
        <form className="flex flex-col gap-1 px-3 pb-2 pt-0.5" onSubmit={handleSubmit}>
          {/* Инструмент */}
          <label className="text-xs font-semibold text-light-fg-secondary dark:text-dark-brown mb-0.5">Инструмент</label>
          {loading ? (
            <div className="py-2 text-center text-light-fg-secondary dark:text-dark-brown">Загрузка инструментов...</div>
          ) : error ? (
            <div className="py-2 text-center text-red-500 dark:text-red-400">{error}</div>
          ) : (
            <CustomSelect
              value={instrument}
              onChange={handleInstrumentChange}
              options={instruments.map(inst => ({ value: inst.ticker, label: `${inst.ticker} — ${inst.title}` }))}
              className="w-full min-h-[32px] px-2 py-1.5 rounded-xl"
            />
          )}
          {/* Цена (editable только для лимит) */}
          <label className="text-xs font-semibold text-light-fg-secondary dark:text-dark-brown mb-0.5 mt-1">Цена</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              step="any"
              value={orderType === 'limit' ? price : 65000}
              onChange={e => setPrice(Number(e.target.value))}
              disabled={orderType === 'market'}
              className="w-full min-h-[32px] px-2 py-1.5 border-b-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg focus:border-b-light-accent dark:focus:border-b-dark-accent outline-none text-sm transition-all duration-300 disabled:bg-light-bg/60 dark:disabled:bg-dark-bg/60 focus:shadow-[0_2px_0_0_rgba(108,99,255,0.25)] dark:focus:shadow-[0_2px_0_0_rgba(129,199,132,0.25)] rounded-xl"
            />
            <span className="text-xs text-light-fg-secondary dark:text-dark-brown">USDT</span>
          </div>
          {/* Количество */}
          <label className="text-xs font-semibold text-light-fg-secondary dark:text-dark-brown mb-0.5 mt-1">Количество</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              step="any"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="Введите количество"
              className="w-full min-h-[32px] px-2 py-1.5 border-b-2 border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg focus:border-b-light-accent dark:focus:border-b-dark-accent outline-none text-sm transition-all duration-300 focus:shadow-[0_2px_0_0_rgba(108,99,255,0.25)] dark:focus:shadow-[0_2px_0_0_rgba(129,199,132,0.25)] rounded-xl"
            />
            <span className="text-xs text-light-fg-secondary dark:text-dark-brown">{instrument}</span>
          </div>
          {/* Быстрые кнопки для выбора количества */}
          <div className="flex gap-1 mt-0 mb-0">
            {[0.25, 0.5, 0.75, 1].map((percent, idx) => (
              <button
                key={percent}
                type="button"
                className="flex-1 rounded-lg py-1 text-xs font-semibold border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors text-light-fg dark:text-dark-fg"
                onClick={() => {
                  const priceVal = orderType === 'limit' ? price : 65000;
                  setAmount(((10000 * percent) / priceVal).toFixed(6));
                }}
              >
                {Math.round(percent * 100)}%
              </button>
            ))}
          </div>
          {/* Итог */}
          <div className="flex justify-between items-center mt-0.5">
            <span className="text-xs text-light-fg-secondary dark:text-dark-brown">Итого</span>
            <span className="font-bold text-sm text-light-fg dark:text-dark-fg">{total ? `$${total}` : '-'}</span>
          </div>
          {/* Баланс и комиссия */}
          <div className="flex justify-between items-center mt-0.5">
            <span className="text-xs text-light-fg-secondary dark:text-dark-brown">Баланс</span>
            <span className="font-semibold text-light-fg dark:text-dark-fg text-xs">${10000}</span>
          </div>
          <div className="flex justify-between items-center mt-0.5">
            <span className="text-xs text-light-fg-secondary dark:text-dark-brown">Комиссия</span>
            <span className="text-xs text-light-fg-secondary dark:text-dark-brown">{fee} USDT</span>
          </div>
          {/* Кнопка */}
          <button
            type="submit"
            className={`w-full mt-2 py-2 rounded-xl font-bold text-base transition-all duration-150
            ${tab === 'buy'
              ? 'bg-light-success/90 text-white dark:bg-dark-accent/90 dark:text-dark-bg hover:bg-light-success dark:hover:bg-dark-accent'
              : 'bg-[#e0a6a6] text-[#7a3a3a] dark:bg-[#6d2323] dark:text-[#e0a6a6] hover:bg-[#e7c3c3] dark:hover:bg-[#8b3232]'}
          `}
          >
            {tab === 'buy' ? 'Купить' : 'Продать'} {instrument}
          </button>
        </form>
        <style>
          {`
        input[type='number']::-webkit-inner-spin-button,
        input[type='number']::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type='number'] {
          -moz-appearance: textfield;
        }
        `}
        </style>
      </div>
      <ToastModal
        open={toastOpen}
        onClose={() => setToastOpen(false)}
        message="Заявка успешно создана!"
        type="success"
        duration={2000}
      />
    </>
  );
};

export default TradeFormWithTabs; 