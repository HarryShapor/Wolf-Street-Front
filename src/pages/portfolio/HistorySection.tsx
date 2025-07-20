import * as React from "react";
import { useState, useMemo, useEffect } from 'react';
import axios from 'axios';

import { Listbox } from '@headlessui/react';
import { API_HOST } from '../../services/Api';
import { useInstruments } from '../../hooks/useInstruments';

const API_URL = `${API_HOST}/order-service/api/v1/orders`;

// Преобразование данных API к формату таблицы
function mapApiToTable(item: any, instruments: any[]) {
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

  // Находим информацию об инструменте
  const instrument = instruments.find(instr => instr.instrumentId === item.instrumentId);

  return {
    id: item.orderId,
    date: item.createdAt ? new Date(item.createdAt).toLocaleDateString('ru-RU') + ', ' + new Date(item.createdAt).toLocaleTimeString('ru-RU') : '',
    type,
    amount: item.lotPrice && item.count ? item.lotPrice * item.count : 0,
    status,
    instrument: instrument ? { ticker: instrument.ticker, title: instrument.title } : null,
  };
}

const typeOptions = ['Все', 'Пополнение', 'Вывод', 'Покупка', 'Продажа'] as const;
const statusOptions = ['Все', 'Успешно', 'В обработке', 'Ошибка'] as const;
const PAGE_SIZE = 5;

type OperationType = typeof typeOptions[number];

// Иконки для типов операций
const typeIcons: Record<string, React.ReactElement> = {
  'Пополнение': (
    <svg className="w-4 h-4 text-light-success dark:text-dark-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  'Вывод': (
    <svg className="w-4 h-4 text-light-error dark:text-light-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  ),
  'Покупка': (
    <svg className="w-4 h-4 text-light-accent dark:text-dark-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  'Продажа': (
    <svg className="w-4 h-4 text-light-accent dark:text-dark-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
};

export default function HistorySection() {
  const [search, setSearch] = useState('');
  const [type, setType] = useState<OperationType>('Все');
  const [status, setStatus] = useState<string>('Все');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { instruments } = useInstruments();

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
          setData(data.map(item => mapApiToTable(item, instruments)));
        } else {
          setData([]);
        }
      })
      .catch(err => {
        setError(err.message || 'Ошибка загрузки истории заявок');
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [instruments]);

  // Фильтрация и поиск
  const filteredData = useMemo(() => {
    return data.filter(item => {
      const matchesType = type === 'Все' || item.type === type;
      const matchesStatus = status === 'Все' || item.status === status;
      const matchesSearch =
        item.type.toLowerCase().includes(search.toLowerCase()) ||
        item.status.toLowerCase().includes(search.toLowerCase()) ||
        String(item.amount).includes(search) ||
        item.date.includes(search) ||
        (item.instrument?.ticker?.toLowerCase().includes(search.toLowerCase()) ||
         item.instrument?.title?.toLowerCase().includes(search.toLowerCase()));
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

  // Защита от выхода за пределы диапазона страниц
  function safeSetPage(newPage: number) {
    setPage(Math.max(1, Math.min(newPage, pageCount)));
  }

  // Функция для отображения кнопок пагинации с ...
  function getPaginationButtons(current: number, total: number): (number | string)[] {
    if (total <= 4) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
    if (current <= 3) {
      return [1, 2, 3, '...', total];
    }
    if (current >= total - 1) {
      return [1, '...', total - 2, total - 1, total];
    }
    return [1, '...', current - 1, current, current + 1, '...', total];
  }

  return (
    <div className="bg-gradient-to-br from-light-card/95 to-light-bg/80 dark:from-dark-card/95 dark:to-[#181926]/90 rounded-2xl shadow-2xl card-glow backdrop-blur-xl border border-light-border/40 dark:border-dark-border/40 p-8 min-h-[400px] flex flex-col transition-all duration-300">
      {/* Заголовок секции */}
      <div className="mb-6 text-[22px] font-bold text-light-accent dark:text-dark-accent flex items-center gap-2">
        <svg className="w-6 h-6 text-light-accent dark:text-dark-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        История операций
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
                <th className="py-2 px-4 font-semibold">Инструмент</th>
                <th className="py-2 px-4 font-semibold">Сумма</th>
                <th className="py-2 px-4 font-semibold">Статус</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-light-fg/70 dark:text-dark-fg/70">Загрузка...</td>
                </tr>
              ) : error ? (
                error === 'Портфель пользователя не найден!' ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="text-[20px] font-bold text-light-fg dark:text-dark-fg mb-1">Сделок пока не было</div>
                        <div className="text-[15px] text-light-fg/70 dark:text-dark-fg/70">Ваша история появится здесь после первой операции</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-red-500 dark:text-red-400">{error}</td>
                  </tr>
                )
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-light-fg/70 dark:text-dark-fg/70">Нет данных</td>
                </tr>
              ) : (
                paginatedData.map(item => (
                  <tr key={item.id} className="border-b border-light-brown/10 dark:border-dark-border/10 hover:bg-light-bg/70 dark:hover:bg-dark-bg/70 transition duration-200 group">
                    <td className="py-2 px-4">{item.date}</td>
                    <td className="py-2 px-4 flex items-center gap-2">
                      {typeIcons[item.type]}
                      <span>{item.type}</span>
                    </td>
                    <td className="py-2 px-4">
                      {item.instrument ? (
                        <span className="font-semibold text-light-accent dark:text-dark-accent">{item.instrument.ticker}</span>
                      ) : (
                        <span className="text-light-fg/50 dark:text-dark-fg/50">—</span>
                      )}
                    </td>
                    <td className="py-2 px-4 font-semibold group-hover:text-light-accent dark:group-hover:text-dark-accent transition">{item.amount?.toLocaleString('ru-RU') ?? 0} ₽</td>
                    <td className="py-2 px-4">
                      <div
                        className={
                          item.status === 'Успешно'
                            ? 'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-light-success/80 to-light-success/60 dark:from-dark-accent/80 dark:to-dark-accent/60 text-white text-sm font-medium shadow-sm'
                            : item.status === 'В обработке'
                            ? 'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-light-accent/80 to-light-accent/60 dark:from-yellow-500/80 dark:to-yellow-700/60 text-white text-sm font-medium shadow-sm'
                            : 'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-light-error/80 to-error/70 dark:from-dark-error-bg/80 dark:to-error/70 text-white text-sm font-medium shadow-sm'
                        }
                      >
                        {item.status === 'Успешно' && (
                          <div className="w-2 h-2 bg-light-success/80 dark:bg-dark-accent/80 rounded-full"></div>
                        )}
                        {item.status === 'В обработке' && (
                          <div className="w-2 h-2 bg-light-accent/80 dark:bg-yellow-700 rounded-full animate-pulse"></div>
                        )}
                        {item.status === 'Ошибка' && (
                          <div className="w-2 h-2 bg-error/80 dark:bg-error/70 rounded-full"></div>
                        )}
                        <span className="text-xs font-semibold">{item.status}</span>
                      </div>
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
              onClick={() => safeSetPage(page - 1)}
              disabled={page === 1}
              className="h-8 px-3 flex items-center justify-center rounded-full bg-transparent text-light-accent dark:text-dark-accent transition hover:bg-light-accent hover:text-white hover:opacity-80 active:opacity-60 dark:hover:bg-dark-accent dark:hover:text-white disabled:opacity-40 text-base"
            >
              Назад
            </button>
            {getPaginationButtons(page, pageCount).map((btn, idx) =>
              btn === '...'
                ? <span key={`dots-${idx}`} className="h-8 w-8 flex items-center justify-center rounded-full text-light-fg/80 dark:text-dark-fg/80 text-center text-base">...</span>
                : <button
                    key={`page-${btn}-${idx}`}
                    onClick={() => safeSetPage(Number(btn))}
                    className={`h-8 w-8 flex items-center justify-center rounded-full font-medium transition duration-150 text-base ${page === btn
                      ? 'bg-light-accent dark:bg-dark-accent text-white shadow hover:opacity-80 active:opacity-60'
                      : 'bg-transparent text-light-accent dark:text-dark-accent hover:bg-light-accent hover:text-white hover:opacity-80 active:opacity-60 dark:hover:bg-dark-accent dark:hover:text-white'}`}
                  >
                    {btn}
                  </button>
            )}
            <button
              onClick={() => safeSetPage(page + 1)}
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