import { useState, useEffect } from 'react';
import { API_HOST } from '../services/Api';

// Кэш цен на уровне модуля
const priceCache: Record<number, number | null> = {};

export function useInstrumentMarketData(instrumentIds: number[]) {
  const [prices, setPrices] = useState<Record<number, number | null>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validIds = instrumentIds.filter(id => typeof id === 'number' && !isNaN(id));
    const idsToFetch = validIds.filter(id => !(id in priceCache));
    if (!idsToFetch.length) {
      setPrices(Object.fromEntries(validIds.map(id => [id, priceCache[id]])));
      return;
    }
    setLoading(true);
    setError(null);

    Promise.all(
      idsToFetch.map(id =>
        fetch(`${API_HOST}/market-data-service/api/v1/orderbook/${id}?limitOrders=1`)
          .then(res => {
            if (res.status === 404) return { id, price: null }; // кэшируем отсутствие стакана
            if (!res.ok) return null;
            return res.json().then(data => ({
              id,
              price: data && data.asks && data.asks.length > 0 ? data.asks[0].price : null
            }));
          })
          .catch(() => ({ id, price: null }))
      )
    )
      .then(results => {
        results.forEach(result => {
          if (result && 'id' in result) priceCache[result.id] = result.price;
        });
        setPrices(Object.fromEntries(validIds.map(id => [id, priceCache[id]])));
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [instrumentIds.join(',')]);

  return { prices, loading, error };
} 