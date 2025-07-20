import { useEffect } from 'react';
import axios from 'axios';
import { API_HOST } from '../services/Api';
import { useNavigate } from 'react-router-dom';

// const API_BASE = `${API_HOST}/user-service/api/v1`;
const API_BASE = `${API_HOST}/user-service/api/v1`;

export default function useAutoRefreshToken() {
  const navigate = useNavigate();
  useEffect(() => {
    const refreshTokenFn = async () => {
      // Не делать refresh на странице /login
      if (window.location.pathname === '/login') return;
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return;
      try {
        const res = await axios.post(
          `${API_BASE}/auth/refresh_token`,
          {},
          {
            headers: { Authorization: `Bearer ${refreshToken}` },
          }
        );
        localStorage.setItem('accessToken', res.data.accessToken);
        if (res.data.refreshToken) {
          localStorage.setItem('refreshToken', res.data.refreshToken);
        }
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Не делать redirect, если уже на /login
        if (window.location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      }
    };
    // Первый вызов сразу при монтировании
    refreshTokenFn();
    // Далее — каждые 10 минут
    const interval = setInterval(refreshTokenFn, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, [navigate]);
} 