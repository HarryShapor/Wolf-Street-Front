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

    setSubmitting(true);
    setFormError('');

    try {
      const orderData = {
        portfolioId: portfolioId,
        instrumentId: selectedInstrument?.instrumentId,
        orderType: 'BUY', // или 'SELL' в зависимости от типа заявки
        quantity: Number(amount),
        price: Number(price),
        totalAmount: total
      };

      const accessToken = localStorage.getItem('accessToken');
      
      console.log('Отправляем заявку:', orderData);
      console.log('Токен авторизации:', accessToken ? `${accessToken.substring(0, 20)}...` : 'не найден');
      if (!accessToken) {
        throw new Error('Токен авторизации не найден. Пожалуйста, войдите в систему.');
      }

      const response = await fetch('http://wolf-street.ru/order-service/api/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        console.error('HTTP Error:', response.status, response.statusText);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        
        let errorMessage = `Ошибка ${response.status}: ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          console.error('Error response:', errorData);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }
        
        if (response.status === 403) {
          errorMessage = 'Доступ запрещен. Возможно, истек токен авторизации. Пожалуйста, войдите в систему заново.';
        } else if (response.status === 401) {
          errorMessage = 'Не авторизован. Пожалуйста, войдите в систему.';
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Заявка успешно создана:', result);
      
      setSubmitting(false);
      setSubmitted(true);
    } catch (error) {
      console.error('Ошибка при создании заявки:', error);
      setFormError(error instanceof Error ? error.message : 'Произошла ошибка при отправке заявки');
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-light-card dark:bg-dark-card rounded-2xl p-7 min-h-[180px] flex flex-col items-center justify-center shadow-lg">
        <div className="w-16 h-16 bg-gradient-to-r from-light-success to-light-accent dark:from-dark-accent dark:to-dark-accent rounded-full flex items-center justify-center mb-4 shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="font-bold text-[22px] text-light-accent dark:text-dark-accent mb-3">Заявка принята!</div>
        <div className="text-light-fg/80 dark:text-dark-brown text-[16px] text-center max-w-[400px] leading-relaxed">
          Ваша заявка обрабатывается. Ожидайте уведомления о статусе сделки. 
          <br />
          <span className="text-light-accent dark:text-dark-accent font-medium">История операций</span> обновится автоматически.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light-card dark:bg-dark-card rounded-2xl p-5 min-h-[180px] flex flex-col items-center justify-center shadow-lg w-full max-w-[260px] mx-auto">
      <div className="font-bold text-[18px] text-light-accent dark:text-dark-accent mb-2 text-center w-full">Оставьте заявку на покупку</div>
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