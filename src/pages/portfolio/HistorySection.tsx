import * as React from "react";
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';
import { FaArrowDown, FaArrowUp, FaShoppingCart, FaExchangeAlt } from 'react-icons/fa';
import { Listbox } from '@headlessui/react';
import { API_HOST } from '../../services/Api';

const API_URL = `${API_HOST}/order-service/api/v1/orders`;

// Преобразование данных API к формату таблицы
function mapApiToTable(item: any) {
  // orderId, instrumentId, count, lotPrice, type, status, createdAt
  let type = '';
  switch (item.type) {
    case 'BUY': type = 'Покупка'; break;
    case 'SALE': type = 'Продажа'; break;
    default: type = item.type;
  }
  let status = '';
  switch (item.status) {
    case 'NEW': status = 'В обработке'; break;
    case 'PARTIALLY_EXECUTED': status = 'В обработке'; break;
    case 'EXECUTED': status = 'Успешно'; break;
    case 'PARTIALLY_CANCELLED': status = 'Ошибка'; break;
    case 'CANCELLED': status = 'Ошибка'; break;
    default: status = item.status;
  }
  return {
    id: item.orderId,
    date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') + ', ' + new Date(item.createdAt).toLocaleTimeString('ru-RU') : '',
    type,
    amount: item.lotPrice && item.count ? item.lotPrice * item.count : 0,
    status,
  };
}

const typeOptions = ['Все', 'Пополнение', 'Вывод', 'Покупка', 'Продажа'] as const;
const statusOptions = ['Все', 'Успешно', 'В обработке', 'Ошибка'] as const;
const PAGE_SIZE = 5;

type OperationType = typeof typeOptions[number];

// Иконки для типов операций
const typeIcons: Record<string, React.ReactElement> = {
  'Пополнение': <FaArrowDown className="text-blue-500 dark:text-blue-400" title="Пополнение" />,
  'Вывод': <FaArrowUp className="text-orange-500 dark:text-orange-400" title="Вывод" />,
  'Покупка': <FaShoppingCart className="text-green-700 dark:text-emerald-300" title="Покупка" />,
  'Продажа': <FaExchangeAlt className="text-purple-500 dark:text-purple-400" title="Продажа" />,
};

export default function HistorySection() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<OperationType>('Все');
  const [status, setStatus] = useState<string>('Все');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загрузка истории из API
  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(API_URL, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    })
      .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки истории заявок');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setData(data.map(mapApiToTable));
        } else {
          setData([]);
        }
      })
      .catch(err => {
        setError(err.message || 'Ошибка загрузки истории заявок');
        setData([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Фильтрация и поиск
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesType = type === 'Все' || item.type === type;
      const matchesStatus = status === 'Все' || item.status === status;
      const matchesSearch =
        item.type.toLowerCase().includes(search.toLowerCase()) ||
        item.status.toLowerCase().includes(search.toLowerCase()) ||
        String(item.amount).includes(search) ||
        item.date.includes(search);
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [search, type, status, data]);

  // Пагинация
  const pageCount = Math.ceil(filteredData.length / PAGE_SIZE);
  const paginatedData = filteredData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Сброс страницы при изменении фильтров
  React.useEffect(() => {
    setPage(1);
  }, [search, type, status]);

  // После вычисления pageCount
  React.useEffect(() => {
    if (page > pageCount) {
      setPage(pageCount === 0 ? 1 : pageCount);
    }
    // eslint-disable-next-line
  }, [pageCount]);

  // Функция для отображения кнопок пагинации с ...
  function getPaginationButtons(current: number, total: number): (number | string)[] {
    const delta = 1;
    const range: (number | string)[] = [];
    for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      range.push(i);
    }
    if (current - delta > 2) range.unshift('...');
    if (current + delta < total - 1) range.push('...');
    range.unshift(1);
    if (total > 1) range.push(total);
    return [...new Set(range)];
  }

  return (
    <div className="bg-gradient-to-br from-light-card/95 to-light-bg/80 dark:from-dark-card/95 dark:to-[#181926]/90 rounded-2xl shadow-2xl card-glow backdrop-blur-xl border border-light-border/40 dark:border-dark-border/40 p-8 min-h-[400px] flex flex-col transition-all duration-300">
      {/* Заголовок секции */}
      <div className="mb-6 text-[22px] font-bold text-light-accent dark:text-dark-accent flex items-center gap-2">
        <FaExchangeAlt className="text-light-accent dark:text-dark-accent text-2xl" /> История операций
      </div>
      {/* Поиск и фильтры */}
      <div className="mb-8 w-full">
        <div className="flex flex-col md:flex-row gap-3 md:gap-4 bg-white/70 dark:bg-dark-card/70 rounded-xl shadow-inner backdrop-blur px-4 py-3 items-center">
          <div className="relative w-full md:w-[240px]">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-fg/80 dark:text-dark-fg/80 text-lg pointer-events-none">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35m1.35-5.15a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </span>
            <input
              type="text"
              placeholder="Поиск по истории..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 pl-10 pr-3 rounded-lg bg-white/80 dark:bg-dark-card/80 shadow-inner border-none text-light-fg/80 dark:text-dark-fg/80 placeholder:text-light-fg/60 dark:placeholder:text-dark-fg/60 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent transition"
            />
          </div>
          <div className="relative w-full md:w-[150px]">
            <Listbox value={type} onChange={setType}>
              <div className="relative w-full md:w-[150px]">
                <Listbox.Button className="h-10 w-full px-4 rounded-lg bg-white/80 dark:bg-dark-card/80 shadow-inner border-none text-left text-light-fg/80 dark:text-dark-fg/80 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent transition cursor-pointer flex items-center justify-between">
                  {type}
                  <span className="ml-2 text-light-fg/80 dark:text-dark-fg/80">▼</span>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-1 w-full rounded-lg bg-white dark:bg-dark-card shadow-lg ring-1 ring-black/10 dark:ring-white/10 focus:outline-none">
                  {typeOptions.map((opt) => (
                    <Listbox.Option
                      key={opt}
                      value={opt}
                      className={({ active, selected }) =>
                        `cursor-pointer select-none px-4 py-2 rounded-lg transition
                        ${active ? 'bg-light-accent/20 dark:bg-dark-accent/20' : ''}
                        ${selected ? 'font-bold text-light-accent dark:text-dark-accent' : 'text-light-fg/80 dark:text-dark-fg/80'}`
                      }
                    >
                      {opt}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
          <div className="relative w-full md:w-[150px]">
            <Listbox value={status} onChange={setStatus}>
              <div className="relative w-full md:w-[150px]">
                <Listbox.Button className="h-10 w-full px-4 rounded-lg bg-white/80 dark:bg-dark-card/80 shadow-inner border-none text-left text-light-fg/80 dark:text-dark-fg/80 focus:outline-none focus:ring-2 focus:ring-light-accent dark:focus:ring-dark-accent transition cursor-pointer flex items-center justify-between">
                  {status}
                  <span className="ml-2 text-light-fg/80 dark:text-dark-fg/80">▼</span>
                </Listbox.Button>
                <Listbox.Options className="absolute z-10 mt-1 w-full rounded-lg bg-white dark:bg-dark-card shadow-lg ring-1 ring-black/10 dark:ring-white/10 focus:outline-none">
                  {statusOptions.map((opt) => (
                    <Listbox.Option
                      key={opt}
                      value={opt}
                      className={({ active, selected }) =>
                        `cursor-pointer select-none px-4 py-2 rounded-lg transition
                        ${active ? 'bg-light-accent/20 dark:bg-dark-accent/20' : ''}
                        ${selected ? 'font-bold text-light-accent dark:text-dark-accent' : 'text-light-fg/80 dark:text-dark-fg/80'}`
                      }
                    >
                      {opt}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </div>
            </Listbox>
          </div>
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <div className="overflow-x-auto rounded-lg flex-1 bg-light-bg/60 dark:bg-dark-bg/60">
          <table className="min-w-full text-left h-full">
            <thead>
              <tr className="bg-light-bg dark:bg-dark-bg">
                <th className="py-2 px-4 font-semibold">Дата</th>
                <th className="py-2 px-4 font-semibold">Тип</th>
                <th className="py-2 px-4 font-semibold">Сумма</th>
                <th className="py-2 px-4 font-semibold">Статус</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-light-fg/70 dark:text-dark-fg/70">Загрузка...</td>
                </tr>
              ) : error ? (
                error === 'Портфель пользователя не найден!' ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="text-[20px] font-bold text-light-fg dark:text-dark-fg mb-1">Сделок пока не было</div>
                        <div className="text-[15px] text-light-fg/70 dark:text-dark-fg/70">Ваша история появится здесь после первой операции</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-red-500 dark:text-red-400">{error}</td>
                  </tr>
                )
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-light-fg/70 dark:text-dark-fg/70">Нет данных</td>
                </tr>
              ) : (
                paginatedData.map(item => (
                  <tr key={item.id} className="border-b border-light-brown/10 dark:border-dark-border/10 hover:bg-light-bg/70 dark:hover:bg-dark-bg/70 transition duration-200 group">
                    <td className="py-2 px-4">{item.date}</td>
                    <td className="py-2 px-4 flex items-center gap-2">
                      {typeIcons[item.type]}
                      <span>{item.type}</span>
                    </td>
                    <td className="py-2 px-4 font-semibold group-hover:text-light-accent dark:group-hover:text-dark-accent transition">{item.amount?.toLocaleString('ru-RU') ?? 0} ₽</td>
                    <td className="py-2 px-4">
                      <span
                        className={
                          item.status === 'Успешно'
                            ? 'inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-sm font-semibold'
                            : item.status === 'В обработке'
                            ? 'inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 text-sm font-semibold'
                            : 'inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 text-sm font-semibold'
                        }
                      >
                        {item.status === 'Успешно' && <span>✔</span>}
                        {item.status === 'В обработке' && <span>⏳</span>}
                        {item.status === 'Ошибка' && <span>✖</span>}
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Пагинация */}
        {pageCount > 1 && (
          <div className="flex justify-center mt-6 gap-2 min-h-[40px]">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className="h-8 px-3 flex items-center justify-center rounded-full bg-transparent text-light-accent dark:text-dark-accent transition hover:bg-light-accent hover:text-white hover:opacity-80 active:opacity-60 dark:hover:bg-dark-accent dark:hover:text-white disabled:opacity-40 text-base"
            >
              Назад
            </button>
            {getPaginationButtons(page, pageCount).map((btn, idx) =>
              btn === '...'
                ? <span key={idx} className="h-8 w-8 flex items-center justify-center rounded-full text-light-fg/80 dark:text-dark-fg/80 text-center text-base">...</span>
                : <button
                    key={btn}
                    onClick={() => setPage(Number(btn))}
                    className={`h-8 w-8 flex items-center justify-center rounded-full font-medium transition duration-150 text-base ${page === btn
                      ? 'bg-light-accent dark:bg-dark-accent text-white shadow hover:opacity-80 active:opacity-60'
                      : 'bg-transparent text-light-accent dark:text-dark-accent hover:bg-light-accent hover:text-white hover:opacity-80 active:opacity-60 dark:hover:bg-dark-accent dark:hover:text-white'}`}
                  >
                    {btn}
                  </button>
            )}
            <button
              onClick={() => setPage(page + 1)}
              disabled={page === pageCount}
              className="h-8 px-3 flex items-center justify-center rounded-full bg-transparent text-light-accent dark:text-dark-accent transition hover:bg-light-accent hover:text-white hover:opacity-80 active:opacity-60 dark:hover:bg-dark-accent dark:hover:text-white disabled:opacity-40 text-base"
            >
              Вперёд
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 