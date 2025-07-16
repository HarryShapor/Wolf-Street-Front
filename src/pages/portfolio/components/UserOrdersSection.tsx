import React, { useEffect, useState } from 'react';
import Card from '../../../components/ui/Card';
import { API_HOST } from '../../../services/Api';

interface Order {
  orderId: number;
  instrumentId: number;
  count: number;
  executedCount: number;
  lotPrice: number;
  executedTotal: number;
  type: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Новые поля для расширенной таблицы
  side?: string;
  icebergAmount?: number;
  filled?: number;
  total?: number;
  activation?: string;
  sor?: string;
  tpSl?: string;
}

const API_URL = `${API_HOST}/order-service/api/v1/orders`;

const columns = [
  { key: 'createdAt', title: 'Дата', sortable: true },
  { key: 'pair', title: 'Пара', sortable: true },
  { key: 'type', title: 'Тип', sortable: true },
  { key: 'side', title: 'Сторона', sortable: true },
  { key: 'price', title: 'Цена', sortable: true },
  { key: 'count', title: 'Количество', sortable: true },
  { key: 'icebergAmount', title: 'Сумма за айсберг-ордер', sortable: true },
  { key: 'filled', title: 'Заполнено', sortable: true },
  { key: 'total', title: 'Всего', sortable: true },
  { key: 'activation', title: 'Условия активации', sortable: false },
  { key: 'sor', title: 'SOR', sortable: false },
  { key: 'tpSl', title: 'TP/SL', sortable: false },
  { key: 'actions', title: <span className="text-right block">Отменить <span className="text-yellow-400 cursor-pointer hover:underline">все</span></span>, sortable: false },
];

function getSortIcon(order: 'asc' | 'desc' | null) {
  if (!order) return null;
  return order === 'asc' ? <span className="ml-1">▲</span> : <span className="ml-1">▼</span>;
}

export default function UserOrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [cancellingAll, setCancellingAll] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(API_URL, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
    })
      .then(async res => {
        if (res.status === 401) throw new Error('Пользователь не авторизован!');
        if (res.status === 404) return [];
        if (!res.ok) throw new Error('Ошибка загрузки заявок');
        return res.json();
      })
      .then(data => {
        // Фильтруем только открытые заявки
        const openStatuses = ['NEW', 'PARTIALLY_EXECUTED'];
        setOrders(Array.isArray(data) ? data.filter((o: Order) => openStatuses.includes(o.status)) : []);
      })
      .catch(err => setError(err.message || 'Ошибка загрузки заявок'))
      .finally(() => setLoading(false));
  }, []);

  // TODO: фильтрация по hideOtherPairs

  // Сортировка данных
  const sortedOrders = [...orders].sort((a, b) => {
    const aVal = a[sortKey as keyof Order];
    const bVal = b[sortKey as keyof Order];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (sortKey === 'createdAt') {
      // Сортировка по дате
      return sortOrder === 'asc'
        ? new Date(aVal as string).getTime() - new Date(bVal as string).getTime()
        : new Date(bVal as string).getTime() - new Date(aVal as string).getTime();
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return 0;
  });

  function handleSort(colKey: string, sortable: boolean) {
    if (!sortable) return;
    if (sortKey === colKey) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(colKey);
      setSortOrder('asc');
    }
  }

  async function cancelOrder(orderId: number) {
    setCancellingId(orderId);
    try {
      await fetch(`${API_HOST}/order-service/api/v1/orders/${orderId}/cancelled`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      // После отмены — обновить список
      setOrders(orders => orders.filter(o => o.orderId !== orderId));
    } catch (e) {
      alert('Ошибка при отмене ордера');
    } finally {
      setCancellingId(null);
    }
  }

  async function cancelAllOrders() {
    if (!orders.length) return;
    if (!window.confirm('Вы уверены, что хотите отменить все ордера?')) return;
    setCancellingAll(true);
    try {
      await Promise.all(
        orders.map(order =>
          fetch(`${API_HOST}/order-service/api/v1/orders/${order.orderId}/cancelled`, {
            method: 'PATCH',
            headers: {
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          })
        )
      );
      setOrders([]);
    } catch (e) {
      alert('Ошибка при массовой отмене ордеров');
    } finally {
      setCancellingAll(false);
    }
  }

  return (
    <div className="w-full max-w-[1500px] mx-auto px-2 sm:px-6 md:px-10 lg:px-16 pb-8">
      <Card className="mt-8 bg-light-bg/95 dark:bg-dark-bg/90 rounded-2xl shadow-xl border border-light-border/40 dark:border-dark-border/40 p-8 flex flex-col transition-all duration-300">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[20px] font-bold text-light-accent dark:text-dark-accent flex items-center gap-2">Открытые ордера ({orders.length})</div>
          {/* Фильтры и настройки */}
        </div>
        {loading || cancellingAll ? (
          <div className="py-12 text-center text-light-fg/70 dark:text-dark-fg/70">{cancellingAll ? 'Отмена всех ордеров...' : 'Загрузка...'}</div>
        ) : error ? (
          <div className="py-12 text-center text-red-500 dark:text-red-400">{error}</div>
        ) : (
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full text-left text-[15px]">
              <thead>
                <tr className="text-light-fg/80 dark:text-dark-brown font-semibold">
                  {columns.map(col => (
                    <th
                      key={typeof col.title === 'string' ? col.title : col.key}
                      className={`py-1 px-2 select-none transition-all whitespace-nowrap
                        ${col.sortable && sortKey === col.key ? 'border-b-2 border-light-accent dark:border-dark-accent text-light-accent dark:text-dark-accent' : 'border-b-2 border-transparent'}
                        ${col.key === 'actions' ? 'text-right' : ''}
                        ${col.sortable ? 'cursor-pointer hover:text-light-accent dark:hover:text-dark-accent' : ''}
                      `}
                      onClick={() => col.key === 'actions' ? cancelAllOrders() : handleSort(col.key, !!col.sortable)}
                    >
                      <span className="inline-flex items-center">
                        {col.key === 'actions' ? (
                          <span
                            className="ml-1 font-semibold cursor-pointer hover:underline transition-colors text-base text-light-fg dark:text-dark-fg hover:text-light-fg/80 dark:hover:text-dark-fg/80"
                            style={{ userSelect: 'none' }}
                          >
                            все
                          </span>
                        ) : (
                          <>
                            {col.title}
                            {col.sortable && sortKey === col.key && getSortIcon(sortOrder)}
                          </>
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="py-12 text-center text-light-fg/70 dark:text-dark-fg/70">У вас нет открытых ордеров.</td>
                  </tr>
                ) : (
                  sortedOrders.map(order => (
                    <tr
                      key={order.orderId}
                      className="text-light-fg dark:text-dark-fg border-b border-light-border/10 dark:border-dark-border/10 transition-all hover:bg-light-accent/5 dark:hover:bg-dark-accent/10"
                    >
                      <td className="py-2 px-3 whitespace-nowrap font-mono">{new Date(order.createdAt).toLocaleString('ru-RU')}</td>
                      <td className="py-2 px-3 font-semibold">{order.instrumentId || '-'}</td>
                      <td className="py-2 px-3">{order.type || '-'}</td>
                      <td className="py-2 px-3">{order.side || '-'}</td>
                      <td className="py-2 px-3 font-mono">{order.lotPrice || '-'}</td>
                      <td className="py-2 px-3 font-mono">{order.count || '-'}</td>
                      <td className="py-2 px-3 font-mono">{order.icebergAmount || '-'}</td>
                      <td className="py-2 px-3 font-mono">{order.filled || '-'}</td>
                      <td className="py-2 px-3 font-mono">{order.total || '-'}</td>
                      <td className="py-2 px-3">{order.activation || '-'}</td>
                      <td className="py-2 px-3">{order.sor || '-'}</td>
                      <td className="py-2 px-3">{order.tpSl || '-'}</td>
                      <td className="py-2 px-3 text-right">
                        <button
                          className="font-semibold cursor-pointer hover:underline transition-colors disabled:opacity-50 text-base text-light-fg dark:text-dark-fg hover:text-light-fg/80 dark:hover:text-dark-fg/80"
                          disabled={!!cancellingId || cancellingAll}
                          onClick={() => cancelOrder(order.orderId)}
                          style={{ background: 'none', border: 'none', padding: 0 }}
                        >
                          {cancellingId === order.orderId ? 'Отмена...' : 'Отменить'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
} 