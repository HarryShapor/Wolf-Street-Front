import React, { useState, useEffect, useMemo } from 'react';
import CustomSelect from '../../components/ui/CustomSelect';
import ToastModal from './ToastModal';
import { API_HOST } from '../../services/Api';
import { useInstruments } from '../../hooks/useInstruments';
import type { Instrument } from '../../hooks/useInstruments';
import { usePortfolioId } from '../../hooks/usePortfolioId';

// Добавляю price как опциональное поле
interface InstrumentWithPrice extends Instrument {
  price?: number;
}

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

interface TradeFormWithTabsProps {
  sideDefault?: 'buy' | 'sell';
}
const TradeFormWithTabs: React.FC<TradeFormWithTabsProps> = ({ sideDefault = 'buy' }) => {
  const { instruments, loading, error } = useInstruments();
  const [tab, setTab] = useState<'buy' | 'sell'>(sideDefault);
  const [orderType, setOrderType] = useState<'limit' | 'market'>('limit');
  const [instrument, setInstrument] = useState<string>('');
  const [amount, setAmount] = useState('');
  // --- toast state ---
  const [toast, setToast] = useState<{ open: boolean; message: string; type: 'success' | 'error' }>({ open: false, message: '', type: 'success' });

  // --- portfolio state ---
  const [portfolioInstruments, setPortfolioInstruments] = useState<{ instrumentId: number, availableAmount: number, ticker: string }[]>([]);
  const portfolioId = usePortfolioId();
  const [balance, setBalance] = useState<number>(0);

  // --- курс USDT→RUB ---
  const usdToRub = 92; // TODO: заменить на актуальный курс, если появится API

  // При выборе инструмента выставлять цену по умолчанию
  useEffect(() => {
    if ((instruments as InstrumentWithPrice[]).length && instrument) {
      const found = (instruments as InstrumentWithPrice[]).find(inst => inst.ticker === instrument);
      if (found && found.price) setPriceRub(found.price);
    }
  }, [instruments, instrument]);

  // При первом рендере выставлять цену по умолчанию
  useEffect(() => {
    if ((instruments as InstrumentWithPrice[]).length && !instrument) {
      setInstrument((instruments as InstrumentWithPrice[])[0].ticker);
      if ((instruments as InstrumentWithPrice[])[0].price) setPriceRub((instruments as InstrumentWithPrice[])[0].price!);
    }
  }, [instruments, instrument]);

  // Загрузка инструментов портфеля (без portfolioId)
  useEffect(() => {
    function fetchPortfolio() {
      fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/instruments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
        .then(res => res.json())
        .then(data => setPortfolioInstruments(data))
        .catch(() => setPortfolioInstruments([]));
    }
    fetchPortfolio();
    const interval = setInterval(fetchPortfolio, 3000);
    return () => clearInterval(interval);
  }, []);

  // Загрузка баланса
  useEffect(() => {
    function fetchBalance() {
      fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/cash`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
        .then(res => res.json())
        .then(data => setBalance(data[0]?.availableAmount ?? 0))
        .catch(() => setBalance(0));
    }
    fetchBalance();
    const interval = setInterval(fetchBalance, 3000);
    return () => clearInterval(interval);
  }, []);

  // Цена теперь в RUB
  const [priceRub, setPriceRub] = useState(0);
  // Итоговая сумма в RUB
  const totalRub = amount ? Number(amount) * priceRub : 0;
  const maxBuy = priceRub > 0 ? balance / priceRub : 0;
  const feeRub = totalRub ? (totalRub * 0.001).toFixed(2) : '0.00';

  function handleAllClick() {
    setAmount((10000 / priceRub).toFixed(6));
  }

  function handleInstrumentChange(val: string) {
    setInstrument(val);
  }

  const selectedInstrument = useMemo(() => instruments.find(inst => inst.ticker === instrument), [instruments, instrument]);
  const portfolioInstrument = useMemo(() => portfolioInstruments.find(inst => inst.instrumentId === selectedInstrument?.instrumentId), [portfolioInstruments, selectedInstrument]);
  const availableToSell = portfolioInstrument?.availableAmount ?? 0;
  const canBuy = tab === 'buy' ? (Number(amount) * priceRub <= balance) : true;
  const canSell = tab === 'sell' ? (Number(amount) <= availableToSell) : true;
  const isAmountValid = !!amount && Number(amount) > 0 && (tab === 'buy' ? canBuy : canSell);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setToast({ open: true, message: 'Укажите корректное количество (> 0)', type: 'error' });
      return;
    }
    if (!priceRub || isNaN(Number(priceRub)) || Number(priceRub) <= 0) {
      setToast({ open: true, message: 'Укажите корректную цену (> 0)', type: 'error' });
      return;
    }
    if (tab === 'buy' && Number(amount) * priceRub > balance) {
      setToast({ open: true, message: 'Недостаточно средств для покупки', type: 'error' });
      return;
    }
    if (tab === 'sell' && Number(amount) > availableToSell) {
      setToast({ open: true, message: 'Недостаточно инструмента для продажи', type: 'error' });
      return;
    }
    const selectedInstrument = instruments.find(inst => inst.ticker === instrument);
    if (!selectedInstrument) {
      setToast({ open: true, message: 'Инструмент не выбран!', type: 'error' });
      return;
    }
    if (!portfolioId) {
      setToast({ open: true, message: 'Портфель не загружен, попробуйте позже', type: 'error' });
      return;
    }
    if (portfolioId === 1) {
      setToast({ open: true, message: 'Внимание: portfolioId=1. Проверьте, что вы авторизованы и backend возвращает корректный id.', type: 'error' });
      console.warn('portfolioId is 1! This is likely a backend or auth issue.');
      return;
    }
    console.log('portfolioId used for order:', portfolioId);
    console.log('instruments:', instruments);
    try {
      const res = await fetch(`${API_HOST}/order-service/api/v1/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          portfolioId: portfolioId, // теперь реальный id портфеля
          lotPrice: priceRub,
          instrumentId: selectedInstrument.instrumentId,
          count: Number(amount),
          type: tab === 'buy' ? 'BUY' : 'SALE',
        })
      });
      if (res.status === 401) throw new Error('Пользователь не авторизован!');
      if (!res.ok) {
        let errorText = '';
        try { errorText = (await res.json()).message; } catch { errorText = await res.text(); }
        throw new Error(errorText || 'Ошибка создания заявки');
      }
      setAmount('');
      setToast({ open: true, message: 'Заявка успешно создана!', type: 'success' });
    } catch (err: any) {
      setToast({ open: true, message: err.message || 'Ошибка создания заявки', type: 'error' });
    }
  }

  return (
    <>
      <div className="w-full min-w-[220px] max-w-[280px] h-full flex flex-col justify-between bg-light-card dark:bg-dark-card border border-light-border/40 dark:border-dark-border/40 rounded-2xl transition-shadow hover:shadow-[0_0_24px_0_#6c63ff] dark:hover:shadow-[0_0_24px_0_#81c784] self-start">
        {/* Вкладки Buy/Sell */}
        <div className="flex border-b border-light-border/40 dark:border-dark-border/40">
          <button className={tabStyles(tab === 'buy', true, true, false)} style={{marginRight: '-1px'}} onClick={() => setTab('buy')}>Купить</button>
          <button className={tabStyles(tab === 'sell', false, false, true)} onClick={() => setTab('sell')}>Продать</button>
        </div>
        {/* Вкладки Лимит/Рынок */}
        <div className="flex gap-1 px-2 pt-1 pb-0.5">
          <button className={orderTabStyles(orderType === 'limit')} onClick={() => setOrderType('limit')}>Лимит</button>
          <button className={orderTabStyles(orderType === 'market')} onClick={() => setOrderType('market')}>Рынок</button>
        </div>
        {/* Форма */}
        <form className="flex flex-col justify-between gap-1 px-2 pb-2 pt-0.5 h-full" onSubmit={handleSubmit}>
          {/* Инструмент */}
          <label className="text-xs font-semibold text-light-fg-secondary dark:text-dark-brown mb-0.5">Инструмент</label>
          {loading ? (
            <div className="py-2 text-center text-light-fg-secondary dark:text-dark-brown">Загрузка инструментов...</div>
          ) : error ? (
            <div className="py-2 px-2 my-2 text-center text-red-500 dark:text-red-400 bg-red-50 dark:bg-[#2a1a1a] rounded-xl border border-red-200 dark:border-red-400/30 min-h-[36px]">
              {error}
            </div>
          ) : (
            <CustomSelect
              value={instrument}
              onChange={handleInstrumentChange}
              options={instruments.map(inst => ({ value: inst.ticker, label: inst.ticker }))}
              className="w-full min-h-[32px] px-2 py-1.5 rounded-xl"
            />
          )}
          {/* Цена (теперь только RUB) */}
          <label className="text-xs font-semibold text-light-fg-secondary dark:text-dark-brown mb-0.5 mt-1">Цена</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="100000000"
              step="any"
              value={priceRub === 0 ? '' : priceRub}
              onChange={e => {
                let val = e.target.value.replace(/^0+(?=\d)/, '');
                // Запретить отрицательные, пустые, 0 и нечисловые значения
                if (!val || isNaN(Number(val)) || Number(val) <= 0) {
                  setPriceRub(0);
                } else {
                  setPriceRub(Number(val));
                }
              }}
              className="w-full min-h-[28px] px-2 py-1 border-b border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg focus:border-b-light-accent dark:focus:border-dark-accent outline-none text-sm text-right font-semibold transition-all duration-300 rounded"
            />
            <span className="text-xs text-light-fg-secondary dark:text-dark-brown">RUB</span>
          </div>
          {/* Количество */}
          <label className="text-xs font-semibold text-light-fg-secondary dark:text-dark-brown mb-0.5 mt-1">Количество</label>
          <div className="flex items-center gap-1">
            <input
              type="number"
              min="0"
              max="1000000"
              step="any"
              value={amount}
              onChange={e => {
                let val = e.target.value.replace(/^0+(?=\d)/, '');
                // Запретить отрицательные, пустые, 0 и нечисловые значения
                if (!val || isNaN(Number(val)) || Number(val) <= 0) {
                  setAmount('');
                } else {
                  setAmount(val);
                }
              }}
              placeholder="Введите количество"
              className="w-full min-h-[28px] px-2 py-1 border-b border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-light-fg dark:text-dark-fg focus:border-b-light-accent dark:focus:border-dark-accent outline-none text-sm text-right font-semibold transition-all duration-300 rounded"
            />
            <span className="text-xs text-light-fg-secondary dark:text-dark-brown">{instrument}</span>
          </div>
          {/* Подсказка по лимиту */}
          {tab === 'sell' && (
            <div className="text-xs text-light-fg-secondary dark:text-dark-brown mb-1">Максимум для продажи: {availableToSell}</div>
          )}
          {tab === 'buy' && (
            <div className="text-xs text-light-fg-secondary dark:text-dark-brown mb-1">Максимум для покупки: {maxBuy.toFixed(6)} ({balance} RUB)</div>
          )}
          {/* Быстрые кнопки для выбора количества */}
          <div className="flex gap-1 mt-0 mb-0">
            {[0.25, 0.5, 0.75, 1].map((percent, idx) => (
              <button
                key={percent}
                type="button"
                className="flex-1 rounded-lg py-1 text-xs font-semibold border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-colors text-light-fg dark:text-dark-fg"
                onClick={() => {
                  const priceVal = priceRub;
                  setAmount(((10000 * percent) / priceVal).toFixed(6));
                }}
              >
                {Math.round(percent * 100)}%
              </button>
            ))}
          </div>
          {/* Итоговая сумма в RUB */}
          <div className="flex justify-between items-center mt-0.5">
            <span className="text-xs text-light-fg-secondary dark:text-dark-brown">Итого</span>
            <span className="font-bold text-sm text-light-fg dark:text-dark-fg">{totalRub ? `${totalRub.toLocaleString('ru-RU', { maximumFractionDigits: 2 })} RUB` : '-'}</span>
          </div>
          {/* Баланс и комиссия */}
          <div className="flex justify-between items-center mt-0.5">
            <span className="text-xs text-light-fg-secondary dark:text-dark-brown">Баланс</span>
            <span className="font-semibold text-light-fg dark:text-dark-fg text-xs">{balance} RUB</span>
          </div>
          <div className="flex justify-between items-center mt-0.5">
            <span className="text-xs text-light-fg-secondary dark:text-dark-brown">Комиссия</span>
            <span className="text-xs text-light-fg-secondary dark:text-dark-brown">{feeRub} RUB</span>
          </div>
          {/* Кнопка */}
          <button
            type="submit"
            disabled={!isAmountValid}
            className={`w-full mt-1 py-1.5 rounded font-bold text-sm transition-all duration-150
            ${tab === 'buy'
              ? 'bg-light-success/90 text-white dark:bg-dark-accent/90 dark:text-dark-bg hover:bg-light-success dark:hover:bg-dark-accent'
              : 'bg-[#e0a6a6] text-[#7a3a3a] dark:bg-[#6d2323] dark:text-[#e0a6a6] hover:bg-[#e7c3c3] dark:hover:bg-[#8b3232]'}
            ${!isAmountValid ? ' opacity-50 cursor-not-allowed' : ''}`}
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
        open={toast.open}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        message={toast.message}
        type={toast.type}
        duration={2500}
      />
    </>
  );
};

export default TradeFormWithTabs; 