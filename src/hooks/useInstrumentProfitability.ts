import { useState, useEffect } from 'react';
import { API_HOST } from '../services/Api';

export function useInstrumentProfitability(instrumentId: number | string | undefined) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!instrumentId) return;
    setLoading(true);
    setError(null);
    fetch(`${API_HOST}/analytic-service/api/v1/analytic/instrument/profitability?instrumentId=${instrumentId}&period=1d`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) throw new Error('Нет аналитики для этого инструмента');
          if (res.status === 401 || res.status === 403) throw new Error('Не авторизован');
          if (res.status === 400) throw new Error('Некорректный запрос');
          throw new Error('Нет аналитики для этого инструмента');
        }
        return res.json();
      })
      .then(setData)
      .catch(e => {
        let msg = e.message || '';
        if (msg.includes('Нет аналитики для этого инструмента')) setError('Нет аналитики для этого инструмента');
        else if (msg.includes('Не авторизован')) setError('Не авторизован');
        else if (msg.includes('Некорректный запрос')) setError('Некорректный запрос');
        else setError('Нет аналитики для этого инструмента');
      })
      .finally(() => setLoading(false));
  }, [instrumentId]);

  return { data, loading, error };
} 