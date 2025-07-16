import React, { useState, useEffect } from 'react';
import { API_HOST } from '../../../services/Api';

interface Order {
  id: string | number;
  date: string;
  pair: string;
  type: string;
  side: string;
  price: number;
  amount: number;
  filled: number;
}

const columns = [
  { key: 'date', label: 'Дата' },
  { key: 'pair', label: 'Пара' },
  { key: 'type', label: 'Тип' },
  { key: 'side', label: 'Сторона' },
  { key: 'price', label: 'Цена' },
  { key: 'amount', label: 'Количество' },
  { key: 'filled', label: 'Заполнено' },
  { key: 'cancel', label: '' }
];

export default function UserOrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [sortField, setSortField] = useState<string>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${API_HOST}/order-service/api/v1/orders`, {
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
        setOrders(Array.isArray(data) ? data.filter((o: any) => openStatuses.includes(o.status)).map((o: any) => ({
          id: o.orderId,
          date: o.createdAt,
          pair: o.instrumentId,
          type: o.type,
          side: o.side,
          price: o.lotPrice,
          amount: o.count,
          filled: o.filled ?? 0,
        })) : []);
      })
      .catch(err => setError(err.message || 'Ошибка загрузки заявок'))
      .finally(() => setLoading(false));
  }, []);

  function handleSort(field: string) {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const sortedOrders = [...orders].sort((a, b) => {
    if (sortField === 'date') {
      return sortDir === 'asc'
        ? Number(new Date(a.date)) - Number(new Date(b.date))
        : Number(new Date(b.date)) - Number(new Date(a.date));
    }
    if (sortField === 'price' || sortField === 'amount' || sortField === 'filled') {
      return sortDir === 'asc'
        ? Number(a[sortField as keyof Order]) - Number(b[sortField as keyof Order])
        : Number(b[sortField as keyof Order]) - Number(a[sortField as keyof Order]);
    }
    // Для строковых полей
    return sortDir === 'asc'
      ? String(a[sortField as keyof Order]).localeCompare(String(b[sortField as keyof Order]))
      : String(b[sortField as keyof Order]).localeCompare(String(a[sortField as keyof Order]));
  });

  return (
    <div className="overflow-x-auto">
      {loading ? (
        <div className="py-12 text-center text-light-fg/70 dark:text-dark-fg/70">Загрузка...</div>
      ) : error ? (
        <div className="py-12 text-center text-red-500 dark:text-red-400">{error}</div>
      ) : (
        <table className="w-full text-xs rounded-xl overflow-hidden">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.key !== 'cancel' && handleSort(col.key)}
                  className={`px-1 py-1 cursor-pointer select-none text-left font-semibold transition-colors
                    ${sortField === col.key ? 'text-light-accent dark:text-dark-accent' : 'text-light-fg-secondary dark:text-dark-brown'}
                    hover:text-light-accent dark:hover:text-dark-accent`}
                >
                  {col.label}
                  {sortField === col.key && (
                    <span className="ml-1">{sortDir === 'asc' ? '▲' : '▼'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedOrders.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-6 text-center text-light-fg/70 dark:text-dark-fg/70">
                  У вас нет открытых ордеров.
                </td>
              </tr>
            ) : (
              sortedOrders.map(order => (
                <tr
                  key={order.id}
                  className="border-b border-light-border/10 dark:border-dark-border/10 hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition"
                >
                  <td className="px-1 py-0.5">{order.date}</td>
                  <td className="px-1 py-0.5">{order.pair}</td>
                  <td className="px-1 py-0.5">{order.type}</td>
                  <td className="px-1 py-0.5">{order.side}</td>
                  <td className="px-1 py-0.5">{order.price}</td>
                  <td className="px-1 py-0.5">{order.amount}</td>
                  <td className="px-1 py-0.5">{order.filled}</td>
                  <td className="px-1 py-0.5">
                    <button className="text-light-error dark:text-error hover:underline text-xs px-1 py-0.5 rounded transition" title="Отменить">✕</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
} 