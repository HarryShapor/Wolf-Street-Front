import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/auth/RegisterPage";
import LoginPage from "./pages/auth/LoginPage";
import "./index.css";
import MainPage from "./pages/main/MainPage";
import PortfolioPage from "./pages/portfolio/PortfolioPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import InstrumentsPage from "./pages/instruments/InstrumentsPage";
import useAutoRefreshToken from './hooks/useAutoRefreshToken';
import TradePage from "./pages/trade/TradePage";

export default function App() {
  useAutoRefreshToken();
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg">
      <Router>
        <Routes>
          {/* <AppRoutes /> */}
          {/* <Route path="/" element={<Navigate to="/register" replace />} /> */}
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/" element={<MainPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/instruments" element={<InstrumentsPage />} />
          <Route path="/trade" element={<TradePage />} />
        </Routes>
      </Router>
    </div>
  );
}
