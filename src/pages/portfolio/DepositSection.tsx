import * as React from 'react';
import { useState, useEffect } from 'react';
import { FaLock, FaCreditCard, FaApple, FaGoogle, FaWallet, FaArrowRight } from 'react-icons/fa';
import Button from '../../components/ui/Button';
import { API_HOST } from '../../services/Api';
import { usePortfolioId } from '../../hooks/usePortfolioId';

const quickAmounts = [1000, 5000, 10000, 50000];
const methods = [
  { label: 'Карта', icon: <FaCreditCard /> },
  { label: 'Apple Pay', icon: <FaApple /> },
  { label: 'Google Pay', icon: <FaGoogle /> },
  { label: 'С другого банка', icon: <FaCreditCard /> },
];

export default function DepositSection() {
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState('₽');
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [balanceError, setBalanceError] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState(methods[0].label);
  const [loading, setLoading] = useState(false);
  const [depositError, setDepositError] = useState('');
  const [depositSuccess, setDepositSuccess] = useState(false);

  const portfolioId = usePortfolioId();

  const handleQuickAmount = (val: number) => setAmount(val.toString());

  useEffect(() => {
    setBalanceLoading(true);
    setBalanceError('');
    fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/cash`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    })
      .then(async res => {
        if (res.status === 401) throw new Error('Пользователь не авторизован!');
        if (res.status === 404) throw new Error('Портфель пользователя не найден!');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBalance(typeof data[0].availableAmount === 'number' ? data[0].availableAmount : 0);
          setCurrency(data[0].currency || '₽');
        } else {
          setBalance(0);
          setCurrency('₽');
        }
      })
      .catch(err => setBalanceError(err.message || 'Не удалось загрузить баланс'))
      .finally(() => setBalanceLoading(false));
  }, []);

  const handleDeposit = async () => {
    setLoading(true);
    setDepositError('');
    setDepositSuccess(false);
    try {
      if (!portfolioId) throw new Error('Не удалось определить портфель пользователя!');
      const res = await fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/cash`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({ currency: currency || 'RUB', amount: Number(amount), portfolioId }) // добавлен portfolioId
      });
      if (res.status === 401) throw new Error('Пользователь не авторизован!');
      if (res.status === 404) throw new Error('Портфель пользователя не найден!');
      if (!res.ok) throw new Error('Ошибка пополнения');
      // Обновить баланс после успешного пополнения
      setDepositSuccess(true);
      setAmount('');
      // Повторно получить баланс
      setBalanceLoading(true);
      setBalanceError('');
      fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/cash`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
        .then(async res => {
          if (res.status === 401) throw new Error('Пользователь не авторизован!');
          if (res.status === 404) throw new Error('Портфель пользователя не найден!');
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data) && data.length > 0) {
            setBalance(typeof data[0].availableAmount === 'number' ? data[0].availableAmount : 0);
            setCurrency(data[0].currency || '₽');
          } else {
            setBalance(0);
            setCurrency('₽');
          }
        })
        .catch(err => setBalanceError(err.message || 'Не удалось загрузить баланс'))
        .finally(() => setBalanceLoading(false));
    } catch (err: any) {
      setDepositError(err.message || 'Ошибка пополнения');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-gradient-to-br from-light-accent/20 via-light-card/80 to-light-bg/80 dark:from-dark-accent/30 dark:via-dark-card/90 dark:to-dark-bg/90 rounded-2xl p-8 max-w-4xl mx-auto shadow-2xl card-glow backdrop-blur-md flex flex-col md:flex-row gap-8 items-stretch border border-light-border/40 dark:border-dark-border/40 transition-all duration-300">
        {/* Левая часть: баланс и быстрые суммы */}
        <div className="flex flex-col items-center justify-center md:w-1/3 gap-4 border-b md:border-b-0 md:border-r border-light-border dark:border-dark-border pb-6 md:pb-0 md:pr-6">
          <div className="flex items-center gap-3">
            <FaWallet className="text-[38px] text-light-accent dark:text-dark-accent" />
            <div className="flex flex-col items-start">
              <span className="text-[15px] text-light-fg/80 dark:text-dark-fg">Текущий баланс</span>
              {balanceLoading ? (
                <span className="text-[32px] font-bold text-light-accent dark:text-dark-accent">Загрузка...</span>
              ) : balanceError && balanceError.includes('не найден') ? (
                <span className="text-[32px] font-bold text-light-accent dark:text-dark-accent">0 ₽</span>
              ) : balanceError ? (
                <span className="text-[16px] text-red-500 dark:text-red-400">{balanceError}</span>
              ) : (
                <span className="text-[32px] font-bold text-light-accent dark:text-dark-accent">{balance.toLocaleString('ru-RU')} {currency}</span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {quickAmounts.map(val => (
              <Button
                key={val}
                type="button"
                size="sm"
                variant={amount === val.toString() ? 'gradient' : 'secondary'}
                onClick={() => handleQuickAmount(val)}
                className="min-w-[90px]"
              >
                +{val.toLocaleString('ru-RU')} ₽
              </Button>
            ))}
          </div>
        </div>
        {/* Центральная часть: ввод суммы */}
        <div className="flex flex-col justify-center items-center md:w-1/3 gap-4 px-2">
          <label htmlFor="deposit-amount" className="block mb-1 text-[15px] font-medium text-light-accent dark:text-dark-accent tracking-wide">Сумма пополнения</label>
          <div className="relative w-full max-w-[240px]">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[22px] text-light-accent dark:text-dark-accent pointer-events-none select-none font-bold">₽</span>
            <input
              id="deposit-amount"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Введите сумму"
              value={amount}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setAmount(val);
              }}
              className="h-14 w-full pl-10 pr-4 rounded-xl bg-white/70 dark:bg-dark-bg/70 shadow focus:shadow-lg border border-transparent focus:border-light-accent dark:focus:border-dark-accent text-[24px] font-bold text-light-accent dark:text-dark-accent placeholder:text-light-accent/40 dark:placeholder:text-dark-accent/40 focus:outline-none transition-all duration-200 text-center"
            />
          </div>
        </div>
        {/* Правая часть: способы и кнопка */}
        <div className="flex flex-col md:w-1/3 min-h-[340px] justify-center items-center gap-4 pl-0 md:pl-6 border-t md:border-t-0 md:border-l border-light-border dark:border-dark-border pt-6 md:pt-0">
          <div className="flex flex-col gap-3 w-full max-w-[220px]">
            {methods.map(m => (
              <Button
                key={m.label}
                type="button"
                size="md"
                variant={method === m.label ? 'gradient' : 'secondary'}
                iconLeft={m.icon}
                onClick={() => setMethod(m.label)}
                className="w-full justify-center"
              >
                {m.label}
              </Button>
            ))}
            <Button
              type="button"
              size="lg"
              variant="gradient"
              loading={loading}
              disabled={!amount || loading}
              onClick={handleDeposit}
              className="w-full mt-2"
            >
              Пополнить
            </Button>
            {depositError && (
              <div className="text-red-500 dark:text-red-400 text-[15px] mt-2 text-center">{depositError}</div>
            )}
            {depositSuccess && !depositError && (
              <div className="text-green-600 dark:text-green-400 text-[15px] mt-2 text-center">Средства успешно зачислены!</div>
            )}
          </div>
          <div className="flex items-center gap-2 justify-center text-[14px] text-light-fg/80 dark:text-dark-fg mt-4">
            <FaLock className="text-[16px]" /> Все операции защищены
          </div>
        </div>
      </div>
    </div>
  );
} 