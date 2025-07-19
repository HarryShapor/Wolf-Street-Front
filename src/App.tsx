import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import "./index.css";
import MainPage from "./pages/main/MainPage";
import PortfolioPage from "./pages/portfolio/PortfolioPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import InstrumentsPage from "./pages/instruments/InstrumentsPage";
import useAutoRefreshToken from "./hooks/useAutoRefreshToken";
import TradePage from "./pages/trade/TradePage";
import NotFoundPage from "./pages/NotFoundPage";
import DepositSection from "./pages/portfolio/DepositSection";
import { useTheme } from "./context/ThemeContext";
import { useEffect } from "react";
import React from "react";

function AuthTokenRefresher() {
  useAutoRefreshToken();
  return null;
}

function getChartColors() {
  // Попытка получить из localStorage, иначе дефолт
  try {
    const raw = localStorage.getItem("chartColors");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed.up === "string" &&
        typeof parsed.down === "string"
      ) {
        return parsed;
      }
    }
  } catch {}
  return { up: "#22d3a8", down: "#f43f5e" };
}

function TradingLineChartBackground() {
  const location = useLocation();

  // Не показываем график на странице инструментов
  if (location.pathname === "/instruments") {
    return null;
  }

  const width = 1920,
    height = 820,
    points = 320;
  const [chartColors, setChartColors] = React.useState(getChartColors());
  // Следим за изменением localStorage (если пользователь меняет цвета в другой вкладке)
  React.useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === "chartColors") setChartColors(getChartColors());
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  // Генерация массива точек с трендом вверх и волатильностью
  function generateLine() {
    const arr = [];
    arr.push(height); // Левая нижняя
    let y = height;
    for (let i = 1; i < points - 1; i++) {
      // Прогресс от 0 (слева) до 1 (справа)
      const t = i / (points - 1);
      // Линейный тренд вверх
      let target = height - t * height;
      // Волатильность
      y =
        target +
        (Math.random() - 0.5) * 80 * (1 - t) +
        (Math.random() - 0.5) * 40;
      y = Math.max(40, Math.min(height - 40, y));
      arr.push(y);
    }
    arr.push(0); // Правая верхняя
    return arr;
  }

  const [line, setLine] = React.useState(generateLine);
  const [progress, setProgress] = React.useState(1); // сколько точек показывать
  const animationRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    let lastTime = performance.now();

    function animate(now: number) {
      if (now - lastTime > 32) {
        // ~30 FPS
        setProgress((prev) => {
          if (prev < points) {
            return prev + 1;
          } else {
            // После паузы — новая линия
            setTimeout(() => {
              setLine(generateLine());
              setProgress(1);
            }, 800);
            return prev;
          }
        });
        lastTime = now;
      }
      animationRef.current = requestAnimationFrame(animate);
    }

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []); // Пустой массив зависимостей!

  const step = width / (points - 1);
  const polyline = line
    .slice(0, progress)
    .map((y, i) => `${i * step},${y}`)
    .join(" ");

  // В SVG:
  return (
    <div className="trading-bg" style={{ zIndex: 0 }}>
      <svg
        width="100vw"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100vw",
          height,
          opacity: 0.18,
          pointerEvents: "none",
        }}
      >
        <defs>
          <linearGradient id="line-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={chartColors.up} stopOpacity="0.8" />
            <stop
              offset="100%"
              stopColor={chartColors.down}
              stopOpacity="0.2"
            />
          </linearGradient>
        </defs>
        <polyline
          points={polyline}
          fill="none"
          stroke="url(#line-gradient)"
          strokeWidth="4"
        />
        <polyline
          points={polyline}
          fill="none"
          stroke="url(#line-gradient)"
          strokeWidth="16"
          opacity="0.18"
          style={{ filter: "blur(8px)" }}
        />
      </svg>
    </div>
  );
}

const NAV = [
  { id: "main", label: "Главная" },
  { id: "about", label: "О проекте" },
  { id: "chart", label: "График" },
  { id: "faq", label: "FAQ" },
];

function AppContent() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <TradingLineChartBackground />
      <AuthTokenRefresher />
      <Routes>
        {/* <AppRoutes /> */}
        {/* Если пользователь не авторизован, раскомментировать следующую строку и реализовать логику проверки авторизации */}
        {/* <Route path="/" element={<Navigate to="/login" replace />} /> */}
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/" element={<MainPage />} />
        <Route
          path="/portfolio"
          element={
            <PortfolioPage theme={theme} setTheme={setTheme} NAV={NAV} />
          }
        />
        <Route path="/instruments" element={<InstrumentsPage />} />
        <Route path="/trade" element={<TradePage />} />
        <Route path="/deposit" element={<DepositSection />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
