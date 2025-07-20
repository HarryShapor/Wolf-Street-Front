import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_HOST } from '../../services/Api';

const API_URL = `${API_HOST}/portfolio-service/api/v1/portfolio/value`;

export default function BalanceSection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [balance, setBalance] = useState<{ instrumentsValue: number; cashAmount: number; totalAmount: number } | null>(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then(res => setBalance(res.data))
      .catch(err => setError('Не удалось загрузить баланс'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-light-card dark:bg-dark-card rounded-2xl p-7 min-h-[180px] flex flex-col items-center justify-center shadow-lg">
      <div className="text-[32px] text-light-accent dark:text-dark-accent mb-2 font-extrabold">Баланс портфеля</div>
      {loading ? (
        <div className="text-lg text-light-fg/70 dark:text-dark-brown">Загрузка...</div>
      ) : error ? (
        <div className="text-red-500 text-lg">{error}</div>
      ) : balance ? (
        <div className="flex flex-col gap-2 items-center w-full">
          <div className="flex gap-4 text-[20px] font-semibold">
            <span className="text-light-fg/80 dark:text-dark-brown">Инструменты:</span>
            <span className="text-light-accent dark:text-dark-accent">₽ {balance.instrumentsValue.toLocaleString('ru-RU')}</span>
          </div>
          <div className="flex gap-4 text-[20px] font-semibold">
            <span className="text-light-fg/80 dark:text-dark-brown">Кэш:</span>
            <span className="text-light-accent dark:text-dark-accent">₽ {balance.cashAmount.toLocaleString('ru-RU')}</span>
          </div>
          <div className="flex gap-4 text-[22px] font-bold mt-2">
            <span className="text-light-fg dark:text-dark-fg">Итого:</span>
            <span className="text-light-accent dark:text-dark-accent">₽ {balance.totalAmount.toLocaleString('ru-RU')}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
} 