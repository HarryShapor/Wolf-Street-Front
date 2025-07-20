import { useState, useEffect } from 'react';
import { API_HOST } from '../services/Api';

export function usePortfolioId() {
  const [portfolioId, setPortfolioId] = useState<number | null>(null);

  useEffect(() => {
    async function fetchPortfolioId() {
      try {
        const res = await fetch(`${API_HOST}/portfolio-service/api/v1/portfolio`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        });
        if (!res.ok) throw new Error('Ошибка получения portfolioId');
        const data = await res.json();
        console.log('portfolio API response:', data);
        if (typeof data.portfolioId === 'number' || typeof data.portfolioId === 'string') {
          setPortfolioId(Number(data.portfolioId));
        } else {
          setPortfolioId(null);
        }
      } catch {
        setPortfolioId(null);
      }
    }
    fetchPortfolioId();
  }, []);

  return portfolioId;
} 