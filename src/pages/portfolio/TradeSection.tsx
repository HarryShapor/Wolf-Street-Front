import React, { useState, useEffect, useMemo } from 'react';
import CustomSelect from '../../components/ui/CustomSelect';
import Button from '../../components/ui/Button';
import { usePortfolioId } from '../../hooks/usePortfolioId';

// Тип для инструмента
// type Instrument = { instrumentId: number; symbol?: string; name?: string; totalAmount: number; price?: number; ... }

export default function TradeSection({ instruments, balance }: { instruments: any[]; balance: number }) {
  const [instrument, setInstrument] = useState('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const portfolioId = usePortfolioId();

  // Выбор первого инструмента
  useEffect(() => {
    if (instruments.length && !instrument) {
      setInstrument(instruments[0].symbol || instruments[0].ticker || String(instruments[0].instrumentId));
      setPrice(instruments[0].price ? String(instruments[0].price) : '');
    }
  }, [instruments, instrument]);

  // Найти выбранный инструмент
  const selectedInstrument = useMemo(() => instruments.find(inst => (inst.symbol || inst.ticker || String(inst.instrumentId)) === instrument), [instruments, instrument]);

  // Обновлять цену при смене инструмента
  useEffect(() => {
    if (selectedInstrument && selectedInstrument.price) {
      setPrice(String(selectedInstrument.price));
    }
  }, [selectedInstrument]);

  const total = amount && price ? Number(amount) * Number(price) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!instrument || !amount || isNaN(Number(amount)) || Number(amount) <= 0 || !price || isNaN(Number(price)) || Number(price) <= 0) {
      setFormError('Пожалуйста, выберите инструмент, введите корректное количество и цену.');
      return;
    }
    if (total > balance) {
      setFormError('Недостаточно средств для покупки такого количества инструмента.');
      return;
    }
    if (!portfolioId) {
      setFormError('Не удалось определить портфель пользователя.');
      return;
    }
    // TODO: здесь должен быть реальный POST-запрос с portfolioId
    // Пример:
    // await fetch(`/api/v1/some-endpoint`, { method: 'POST', body: JSON.stringify({ portfolioId, ... }) })
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="bg-light-card dark:bg-dark-card rounded-2xl p-7 min-h-[180px] flex flex-col items-center justify-center shadow-lg">
        <div className="text-[48px] text-light-accent dark:text-dark-accent mb-3">✅</div>
        <div className="font-bold text-[22px] text-light-accent dark:text-dark-accent mb-2">Заявка отправлена!</div>
        <div className="text-light-fg/80 dark:text-dark-brown text-[16px] text-center max-w-[400px]">
          Мы получили вашу заявку и свяжемся с вами для совершения сделки.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light-card dark:bg-dark-card rounded-2xl p-5 min-h-[180px] flex flex-col items-center justify-center shadow-lg w-full max-w-[260px] mx-auto">
      <div className="font-bold text-[18px] text-light-accent dark:text-dark-accent mb-2 text-center w-full">Оставьте заявку на сделку</div>
      <form className="flex flex-col gap-2 w-full items-center" onSubmit={handleSubmit}>
        <div className="w-full flex flex-col items-center">
          <label className="block text-[11px] font-semibold mb-0.5 text-light-fg-secondary dark:text-dark-brown">Инструмент</label>
          <CustomSelect
            value={instrument}
            onChange={val => {
              setInstrument(val);
              const found = instruments.find(inst => (inst.symbol || inst.ticker || String(inst.instrumentId)) === val);
              setPrice(found && found.price ? String(found.price) : '');
            }}
            options={instruments.map(inst => ({ label: inst.name || inst.symbol || inst.ticker || String(inst.instrumentId), value: inst.symbol || inst.ticker || String(inst.instrumentId) }))}
            className="min-w-[140px] w-[160px]"
          />
        </div>
        <div className="w-full flex flex-col items-center">
          <label className="block text-[11px] font-semibold mb-0.5 text-light-fg-secondary dark:text-dark-brown">Количество</label>
          <input
            type="number"
            className="w-full px-3 py-2.5 rounded-lg border-2 bg-white dark:bg-[#18191c] text-light-fg dark:text-[#b0b3b8] border-light-border dark:border-[#3e3c3a] shadow-inner dark:shadow-inner placeholder:text-light-fg/60 dark:placeholder:text-[#888c94] focus:border-light-accent dark:focus:border-dark-accent focus:shadow-[0_0_0_3px_rgba(197,107,98,0.2)] dark:focus:shadow-[0_0_0_3px_rgba(129,199,132,0.2)] min-h-[24px] text-[13px] appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-ms-input-placeholder]:appearance-none"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min={0.01}
            step={0.01}
            inputMode="decimal"
            placeholder="0.00"
          />
        </div>
        <div className="w-full flex flex-col items-center">
          <label className="block text-[11px] font-semibold mb-0.5 text-light-fg-secondary dark:text-dark-brown">Цена</label>
          <input
            type="number"
            className="w-full px-3 py-2.5 rounded-lg border-2 bg-white dark:bg-[#18191c] text-light-fg dark:text-[#b0b3b8] border-light-border dark:border-[#3e3c3a] shadow-inner dark:shadow-inner placeholder:text-light-fg/60 dark:placeholder:text-[#888c94] focus:border-light-accent dark:focus:border-dark-accent focus:shadow-[0_0_0_3px_rgba(197,107,98,0.2)] dark:focus:shadow-[0_0_0_3px_rgba(129,199,132,0.2)] min-h-[24px] text-[13px] appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-ms-input-placeholder]:appearance-none"
            value={price}
            onChange={e => setPrice(e.target.value)}
            min={0.01}
            step={0.01}
            inputMode="decimal"
            placeholder="0.00"
          />
        </div>
        <div className="flex flex-row justify-between text-[11px] text-light-fg dark:text-dark-brown px-1 mt-1 mb-1">
          <span>Итого: <span className="font-bold">{total ? total.toLocaleString('ru-RU', {maximumFractionDigits: 2}) : '-'} ₽</span></span>
          <span>Баланс: <span className="font-bold">{balance.toLocaleString('ru-RU', {maximumFractionDigits: 2})} ₽</span></span>
        </div>
        {formError && <div className="text-red-500 dark:text-red-400 text-xs text-center">{formError}</div>}
        {amount && price && total > balance && (
          <div className="text-red-500 dark:text-red-400 text-xs text-center">Недостаточно средств для покупки {amount} {selectedInstrument?.symbol || selectedInstrument?.ticker}.</div>
        )}
        <Button type="submit" size="lg" variant="gradient" loading={submitting} className="w-full mt-1">
          Оставить заявку
        </Button>
      </form>
    </div>
  );
} 