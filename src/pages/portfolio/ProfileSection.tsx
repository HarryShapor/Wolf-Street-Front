import React, { useState, useRef, useEffect } from 'react';
import VerificationSection from './VerificationSection';
import DepositSection from './DepositSection';
import TradeSection from './TradeSection';
import BalanceSection from './BalanceSection';
// import AssetsSection from './AssetsSection';
import HistorySection from './HistorySection';
import { getCurrencyRates, API_HOST } from '../../services/Api';
import clsx from 'clsx';
import ProfileHeader from './components/ProfileHeader';
import Card from '../../components/ui/Card';
import Stepper from './components/Stepper';
import type { Step } from './components/StepTypes';
import Button from '../../components/ui/Button';
import axios from "axios";
import { LoaderBlock, ErrorBlock } from '../../components/ui/LoadingButton';
import fx from "money";
import currencyCodes from "currency-codes";
import { createPortal } from "react-dom";
import ReactDOM from 'react-dom';
import ReactECharts from 'echarts-for-react';
import { useTheme } from '../../context/ThemeContext';
import DEFAULT_AVATAR_SVG from '../../components/ui/defaultAvatar';
import { getUserAvatarUrl } from '../../services/AvatarService';
import { useNavigate } from 'react-router-dom';
import { FaWallet, FaChartLine, FaCreditCard } from 'react-icons/fa';
import { BiAnalyse } from 'react-icons/bi';
import { useInstruments } from '../../hooks/useInstruments';
import { useInstrumentProfitability } from '../../hooks/useInstrumentProfitability';
// Локальное определение типа Instrument для аналитики
type InstrumentBase = {
  instrumentId: number;
  availableAmount: number;
  blockedAmount: number;
  totalAmount: number;
  symbol?: string;
  name?: string;
  type?: string;
  price?: number;
  iconUrl?: string;
  ticker?: string;
  title?: string;
};

// Мок-история операций
const mockHistory = [
  { date: '2024-06-01', asset: 'BTC', action: 'Покупка', amount: '+0.05 BTC', value: '+325 000 ₽', status: 'Успешно' },
  { date: '2024-05-28', asset: 'ETH', action: 'Продажа', amount: '-1.2 ETH', value: '-384 000 ₽', status: 'Успешно' },
  { date: '2024-05-20', asset: 'USDT', action: 'Пополнение', amount: '+500 USDT', value: '+46 000 ₽', status: 'Успешно' },
  { date: '2024-05-15', asset: 'TON', action: 'Вывод', amount: '-50 TON', value: '-10 500 ₽', status: 'В обработке' },
];

const STEPS: Step[] = [
  { key: 'wallet', label: 'Актуальный кошелёк' },
  { key: 'empty', label: 'Анализ' },
];

function OperationHistoryBlock({ compact = false, maxRows }: { compact?: boolean, maxRows?: number }) {
  const rows = maxRows ? mockHistory.slice(0, maxRows) : (compact ? mockHistory.slice(0, 3) : mockHistory);
  return (
    <div className="flex flex-col min-w-0">
      <table className="min-w-full text-left">
        <thead>
          <tr className="text-[15px] text-light-fg/80 dark:text-dark-brown font-semibold">
            <th className="py-2 px-3">Дата</th>
            <th className="py-2 px-3">Актив</th>
            <th className="py-2 px-3">Действие</th>
            <th className="py-2 px-3">Сумма</th>
            <th className="py-2 px-3">Статус</th>
            <th className="py-2 px-3">В рублях</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((op, i) => (
            <tr key={i} className="hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-all group">
              <td className="py-2 px-3 whitespace-nowrap font-mono">{op.date}</td>
              <td className="py-2 px-3 font-semibold">{op.asset}</td>
              <td className="py-2 px-3">{op.action}</td>
              <td className="py-2 px-3 font-mono">{op.amount}</td>
              <td className={`py-2 px-3 font-semibold ${op.status === 'Успешно' ? 'text-green-500' : 'text-yellow-500'}`}>{op.status}</td>
              <td className="py-2 px-3 font-mono">{op.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type CurrencyRatesCardProps = {
  rates: { [code: string]: number };
  loading: boolean;
  error: boolean;
  onRefresh: () => void;
  compact?: boolean;
};

function CurrencyRatesCard({ rates, loading, error, onRefresh, compact = false }: CurrencyRatesCardProps) {
  const [search, setSearch] = React.useState("");
  const [allCodes, setAllCodes] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [dropdownPos, setDropdownPos] = React.useState({ top: 0, left: 0, width: 0 });

  // Топ-5 популярных валют
  const popular = ["USD", "EUR", "CNY", "GBP", "JPY"];

  // Получить название валюты по коду
  const getCurrencyName = (code: string) => {
    const entry = currencyCodes.code(code);
    return entry ? entry.currency : code;
  };

  React.useEffect(() => {
    setAllCodes(rates ? Object.keys(rates) : []);
  }, [rates]);

  // Функция для обновления позиции dropdown
  const updateDropdownPos = React.useCallback(() => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
  }, []);

  // Открытие dropdown и обновление позиции
  const openDropdown = () => {
    setShowDropdown(true);
    setTimeout(updateDropdownPos, 0);
  };

  // Обновлять позицию при ресайзе/скролле
  React.useEffect(() => {
    if (!showDropdown) return;
    updateDropdownPos();
    const handle = () => updateDropdownPos();
    window.addEventListener('resize', handle);
    window.addEventListener('scroll', handle, true);
    return () => {
      window.removeEventListener('resize', handle);
      window.removeEventListener('scroll', handle, true);
    };
  }, [showDropdown, updateDropdownPos]);

  // Закрытие по клику вне и по Esc
  React.useEffect(() => {
    if (!showDropdown) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        inputRef.current && !inputRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    function handleEsc(event: KeyboardEvent) {
      if (event.key === 'Escape') setShowDropdown(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showDropdown]);

  // Фильтрация по поиску (по коду и названию)
  const filtered = React.useMemo(() => {
    if (!search) return [];
    const s = search.trim().toUpperCase();
    return allCodes.filter(code => {
      const name = getCurrencyName(code).toUpperCase();
      return code.includes(s) || name.includes(s);
    });
  }, [search, allCodes]);

  // Функция для получения курса X/RUB
  const getRateToRUB = (code: string) => {
    if (!rates[code] || !rates["RUB"]) return "-";
    return (rates["RUB"] / rates[code]).toFixed(4);
  };

  // Полный режим
  return (
    <div className="flex flex-col min-w-[260px] max-w-sm w-full p-2.5 bg-white dark:bg-dark-card rounded-xl shadow-lg border border-light-border dark:border-dark-border">
      {/* <div className="text-[20px] font-bold mb-3 text-light-accent dark:text-dark-accent">Курс валют</div> */}
      {loading ? (
        <div className="text-light-fg/80 dark:text-dark-brown text-[15px] my-3">Загрузка...</div>
      ) : error ? (
        <div className="text-red-500 text-[15px] my-3 flex items-center gap-2">Ошибка загрузки <button onClick={onRefresh} className="ml-2 text-xs underline">Повторить</button></div>
      ) : (
        <div className="flex flex-col md:flex-row gap-4 w-full">
          {/* Левая колонка: топ-5 валют */}
          <div className="flex-1 flex flex-col gap-1 justify-start">
            {popular.map(code => (
              <div key={code} className="flex items-center gap-2 text-[15px] font-semibold text-light-fg dark:text-dark-fg">
                <span className="min-w-[60px]">{code}</span>
                <span className="text-light-accent dark:text-dark-accent font-bold">{getRateToRUB(code)}</span>
                <span className="text-light-fg/60 dark:text-dark-brown text-xs ml-2">{getCurrencyName(code)}</span>
              </div>
            ))}
          </div>
          {/* Правая колонка: поиск и результаты */}
          <div className="flex-1 flex flex-col gap-1 justify-start">
            <div className="w-full">
              <input
                ref={inputRef}
                type="text"
                placeholder="Поиск по коду или названию валюты (например, USD, евро)"
                value={search}
                onFocus={openDropdown}
                onChange={e => {
                  setSearch(e.target.value);
                  openDropdown();
                }}
                className="w-full px-2 py-1 rounded border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-light-fg dark:text-dark-fg focus:outline-none focus:ring-2 focus:ring-light-accent/30 dark:focus:ring-dark-accent/30 text-[14px]"
              />
              {search && showDropdown && ReactDOM.createPortal(
                <div
                  ref={dropdownRef}
                  style={{
                    position: 'absolute',
                    top: dropdownPos.top,
                    left: dropdownPos.left,
                    width: dropdownPos.width,
                    minWidth: 260,
                    zIndex: 9999,
                  }}
                  className="currency-dropdown-scrollbar bg-white dark:bg-dark-bg border border-light-border dark:border-dark-border rounded shadow-lg max-h-72 overflow-y-auto transition-all duration-150 overflow-x-hidden"
                >
                  {filtered.length === 0 ? (
                    <div className="text-light-fg/60 dark:text-dark-brown text-[13px] px-3 py-2">Валюта не найдена</div>
                  ) : (
                    filtered.slice(0, 20).map(code => (
                      <div
                        key={code}
                        className="flex items-center gap-1 text-[14px] text-light-fg dark:text-dark-fg px-2.5 py-1.5 hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition cursor-pointer"
                      >
                        <span className="min-w-[48px] mr-1">{code}</span>
                        <span className="text-light-accent dark:text-dark-accent font-bold mr-1">{getRateToRUB(code)}</span>
                        <span className="block w-full text-light-fg/60 dark:text-dark-brown text-xs leading-tight truncate" style={{maxWidth: '90px'}} title={getCurrencyName(code)}>
                          {getCurrencyName(code)}
                        </span>
                      </div>
                    ))
                  )}
                </div>,
                document.body
              )}
            </div>
          </div>
        </div>
      )}
      <div className="text-light-fg/80 dark:text-dark-brown text-[13px] mt-2">Курс за 1 единицу валюты</div>
    </div>
  );
}

const API_BASE = `${API_HOST}/user-service/api/v1`;

export default function ProfileSection({ onGoToDeposit }: { onGoToDeposit: () => void }) {
  const navigate = useNavigate();
  // Все хуки должны быть до любых return/if!
  const [user, setUser] = useState<{ email: string; phone: string; username: string } | null>(null);
  const [status, setStatus] = useState<'Обычный' | 'VIP'>('Обычный');
  const [avatarUrl, setAvatarUrl] = useState<string>(DEFAULT_AVATAR_SVG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    phone: '',
  });

  // --- КУРСЫ ВАЛЮТ ---
  const [rates, setRates] = useState<{ [code: string]: number }>({});
  const [ratesLoading, setRatesLoading] = useState(true);
  const [ratesError, setRatesError] = useState(false);
  const fetchRates = React.useCallback(() => {
    setRatesLoading(true);
    setRatesError(false);
    fetch("https://open.er-api.com/v6/latest/USD")
      .then(res => res.json())
      .then(data => {
        if (data && data.result === "success" && data.rates) {
          setRates(data.rates);
        } else {
          setRatesError(true);
        }
      })
      .catch(() => setRatesError(true))
      .finally(() => setRatesLoading(false));
  }, []);
  useEffect(() => { fetchRates(); }, [fetchRates]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${API_BASE}/user/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setUser(res.data);
      } catch (err) {
        setError("Не удалось загрузить данные пользователя");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  // Получение аватара пользователя
  useEffect(() => {
    const fetchAvatar = async () => {
      const url = await getUserAvatarUrl();
      setAvatarUrl(url);
    };
    fetchAvatar();
  }, []);

  const handleRetry = () => {
    setLoading(true);
    setError("");
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/user/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        setUser(res.data);
        // ---
        // Фейковые данные:
        // setUser({
        //   username: 'demo_user',
        //   email: 'demo@example.com',
        //   phone: '+7 999 123-45-67',
        // });
      } catch (err) {
        setError("Не удалось загрузить данные пользователя");
      } finally {
        setLoading(false);
      }
    })();
  };

  // Функции для массового редактирования
  const handleFieldChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };
  const handleSave = async () => {
    // TODO: добавить валидацию и отправку запроса
    setEditing(false);
  };
  const handleCancel = () => {
    if (user) {
      setForm({
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
    setEditing(false);
  };

  // --- Состояние инструментов для всего портфеля ---
  const [instruments, setInstruments] = useState<InstrumentBase[]>([]);
  const [instrumentsLoading, setInstrumentsLoading] = useState(true);
  const [instrumentsError, setInstrumentsError] = useState('');
  const midPrices = useAllOrderbookSpreads(instruments.map(a => a.instrumentId));

  useEffect(() => {
    setInstrumentsLoading(true);
    setInstrumentsError('');
    fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/instruments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    })
      .then(async res => {
        if (res.status === 401) throw new Error('Пользователь не авторизован!');
        if (res.status === 404) throw new Error('Портфель пользователя не найден!');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setInstruments(data);
        else setInstruments([]);
      })
      .catch(err => setInstrumentsError(err.message || 'Ошибка загрузки инструментов'))
      .finally(() => setInstrumentsLoading(false));
  }, []);

  // --- Баланс пользователя (кэш) ---
  const [balance, setBalance] = useState<number>(0);
  useEffect(() => {
    fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/cash`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    })
      .then(async res => {
        if (res.status === 401) throw new Error('Пользователь не авторизован!');
        if (res.status === 404) throw new Error('Портфель пользователя не найден!');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setBalance(typeof data[0].availableAmount === 'number' ? data[0].availableAmount : 0);
        } else {
          setBalance(0);
        }
      })
      .catch(() => setBalance(0));
  }, []);

  const { instruments: allInstruments } = useInstruments();
  // Обогащаю портфельные инструменты тикером и title из справочника
  const enrichedInstruments: InstrumentBase[] = instruments.map(a => {
    const meta = allInstruments.find((inst: any) => inst.instrumentId === a.instrumentId);
    return {
      ...a,
      ticker: meta?.ticker || a.ticker || a.symbol || String(a.instrumentId),
      title: meta?.title || a.name || '',
    };
  });

  if (loading) return <LoaderBlock text="Загружаем профиль..." />;
  if (error) return <ErrorBlock text={error} onRetry={handleRetry} />;
  if (!user) return null;

  return (
    <div className="bg-gradient-to-br from-light-card to-light-bg dark:from-dark-card dark:to-[#181926] rounded-2xl p-8 shadow-2xl card-glow backdrop-blur-md border border-light-border/40 dark:border-dark-border/40 text-light-fg dark:text-dark-fg mt-6 transition-all duration-300">
      {/* Шапка пользователя */}
      <ProfileHeader
        avatar={avatarUrl}
        nickname={user.username}
        status={status}
      />
      {/* Остальной контент профиля */}
      <StepperPanel onDepositClick={onGoToDeposit} rates={rates} ratesLoading={ratesLoading} ratesError={ratesError} onRatesRefresh={fetchRates}
        instruments={enrichedInstruments}
        enrichedInstruments={enrichedInstruments}
        instrumentsLoading={instrumentsLoading}
        instrumentsError={instrumentsError}
      />
      <div className="flex flex-row gap-6 items-stretch w-full">
        <div className="max-w-[280px] min-w-[220px] w-full flex-shrink-0 mr-2 min-h-[220px] max-h-[360px] h-full flex flex-col justify-center">
          <TradeSection instruments={enrichedInstruments as InstrumentBase[]} balance={balance} />
        </div>
        <div className="flex-1 min-w-0 flex items-stretch min-h-[220px] max-h-[360px] h-full">
          <div className="w-full h-full overflow-y-auto">
            <div className="h-full">
              <PortfolioInstrumentsList instruments={enrichedInstruments as InstrumentBase[]} loading={instrumentsLoading} error={instrumentsError} noMargin />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepperPanel({ onDepositClick, rates, ratesLoading, ratesError, onRatesRefresh, instruments, enrichedInstruments, instrumentsLoading, instrumentsError }: {
  onDepositClick: () => void,
  rates: { [code: string]: number },
  ratesLoading: boolean,
  ratesError: boolean,
  onRatesRefresh: () => void,
  instruments: InstrumentBase[],
  enrichedInstruments: InstrumentBase[],
  instrumentsLoading: boolean,
  instrumentsError: string
}) {
  const [active, setActive] = useState<string>('wallet');

  // Баланс кошелька
  const [walletLoading, setWalletLoading] = useState(true);
  const [walletError, setWalletError] = useState('');
  const [walletAmount, setWalletAmount] = useState<number>(0);
  const [walletCurrency, setWalletCurrency] = useState<string>('₽');

  useEffect(() => {
    setWalletLoading(true);
    setWalletError('');
    fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/cash`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    })
      .then(async res => {
        if (res.status === 401) throw new Error('Пользователь не авторизован!');
        if (res.status === 404) throw new Error('Портфель пользователя не найден!');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setWalletAmount(typeof data[0].availableAmount === 'number' ? data[0].availableAmount : 0);
          setWalletCurrency(data[0].currency || '₽');
        } else {
          setWalletAmount(0);
          setWalletCurrency('₽');
        }
      })
      .catch(err => setWalletError(err.message || 'Не удалось загрузить баланс'))
      .finally(() => setWalletLoading(false));
  }, []);

  const cards = [
    {
      key: 'wallet',
      title: 'Актуальный кошелёк',
      icon: <FaWallet className="text-[38px] ml-4 flex-shrink-0 text-light-accent dark:text-dark-accent" />, // заменили emoji на иконку
      content: (
        <div className="flex flex-col items-start gap-1 w-full">
          {walletLoading ? (
            <span className="text-[28px] font-extrabold text-light-accent dark:text-dark-accent mb-0.5">Загрузка...</span>
          ) : walletError ? (
            <span className="text-red-500 text-[16px] mb-0.5">{walletError}</span>
          ) : (
            <span className="text-[28px] font-extrabold text-light-accent dark:text-dark-accent mb-0.5">
              {walletCurrency} {walletAmount.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          )}
          <span className="text-light-fg/80 dark:text-dark-brown text-[15px]">Ваш баланс</span>
          <div className="w-full flex justify-start pl-2">
            <button
              onClick={onDepositClick}
              className="mt-4 w-auto px-5 py-2 rounded-lg bg-light-accent dark:bg-dark-accent text-white font-semibold shadow-md transition-all duration-200 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-light-accent/60 dark:focus:ring-dark-accent/60"
              type="button"
            >
              Пополнить
            </button>
          </div>
        </div>
      ),
    },
    {
      key: 'empty',
      title: 'Анализ портфеля',
      icon: <BiAnalyse className="text-[38px] ml-4 flex-shrink-0 text-light-accent dark:text-dark-accent" />, // цвет в палитру сайта
      content: <div className="w-full flex flex-col items-start"><PortfolioMiniAnalytics instruments={enrichedInstruments} loading={instrumentsLoading} error={instrumentsError} /></div>,
    },
  ];
  if (active === 'deposit') {
    cards.push({
      key: 'deposit',
      title: 'Пополнить счёт',
      icon: <FaCreditCard className="text-[38px] ml-4 flex-shrink-0 text-light-accent dark:text-dark-accent" />, // заменили emoji на иконку
      content: <div className="w-full flex flex-col items-start"><DepositSection /></div>,
    });
  }
  return (
    <div className="w-full mb-8 relative">
      <StepperModern steps={STEPS} active={active} onStepClick={setActive} />
      <div className="flex flex-row w-full min-h-[220px] gap-4">
        {cards.map((card, idx) => {
          const isActive = active === card.key;
          return (
            <div
              key={card.key}
              onClick={() => setActive(card.key)}
              className={
                `transition-all duration-500 overflow-hidden flex flex-col min-h-[220px] h-full cursor-pointer select-none rounded-xl ` +
                (isActive
                  ? 'flex-grow bg-light-card dark:bg-dark-card shadow-xl ring-2 ring-light-accent/40 dark:ring-dark-accent/40 border-light-accent dark:border-dark-accent z-10 px-8 py-6 items-start text-left'
                  : 'w-[200px] md:w-[220px] bg-light-card dark:bg-dark-card opacity-90 hover:opacity-100 hover:shadow-lg z-0 items-center justify-center text-center p-0') +
                (idx !== 0 ? ' border-l border-light-border dark:border-dark-border' : '')
              }
              style={{ boxSizing: 'border-box', position: 'relative' }}
            >
              {isActive ? (
                <div className="flex flex-col justify-between w-full h-full">
                  <div className="flex items-start justify-between w-full mb-4">
                    <div className="text-[22px] font-bold text-light-fg dark:text-dark-fg leading-tight">{card.title}</div>
                    {card.icon && <span className="text-[38px] ml-4 flex-shrink-0">{card.icon}</span>}
                  </div>
                  <div className="flex-1 flex flex-col justify-start w-full gap-4 overflow-y-auto">
                    {card.content}
                    {/* actions убраны */}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full px-2">
                  {card.icon && <span className="text-[28px] mb-2">{card.icon}</span>}
                  <div className="text-[15px] font-semibold text-light-fg dark:text-dark-fg leading-tight">{card.title}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Новый современный stepper
function StepperModern({ steps, active, onStepClick }: { steps: Step[]; active: string; onStepClick: (key: string) => void }) {
  return (
    <div className="flex items-center justify-between mb-6 px-2 min-h-[48px]">
      {steps.map((step, idx) => (
        <React.Fragment key={step.key}>
          <div
            className={`flex flex-col items-center cursor-pointer group transition-all duration-200 select-none`}
            onClick={() => onStepClick(step.key)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[20px] border-2 z-10 transition-all duration-200
              ${active === step.key
                ? 'bg-light-accent dark:bg-dark-accent text-white border-light-accent dark:border-dark-accent shadow-xl ring-2 ring-light-accent/30 dark:ring-dark-accent/30'
                : 'bg-light-bg dark:bg-dark-bg text-light-fg/80 dark:text-dark-brown border-light-border dark:border-dark-border group-hover:border-light-accent/60 dark:group-hover:border-dark-accent/60'}
            `}>
              {idx + 1}
            </div>
            <div className={`mt-2 text-[15px] font-medium text-center transition-colors duration-200
              ${active === step.key ? 'text-light-accent dark:text-dark-accent' : 'text-light-fg/80 dark:text-dark-brown group-hover:text-light-accent/80 dark:group-hover:text-dark-accent/80'}`}>{step.label}</div>
          </div>
          {idx < steps.length - 1 && (
            <div className="flex-1 h-0.5 mx-2 bg-gradient-to-r from-light-border/60 via-light-accent/30 to-light-border/60 dark:from-dark-border/60 dark:via-dark-accent/30 dark:to-dark-border/60" />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export function Portfolio3DPie({ assets }: { assets: { symbol: string; name: string; percent: number; value: number; color: string }[] }) {
  const { theme } = useTheme();
  const total = assets.reduce((sum, a) => sum + a.value, 0);
  const accent = theme === 'dark' ? '#34d399' : '#059669';
  // Цвета для секторов (можно расширить)
  const PIE_COLORS = [
    { light: ['#a78bfa', '#6366f1'], dark: ['#a78bfa', '#6366f1'] },
    { light: ['#60a5fa', '#2563eb'], dark: ['#60a5fa', '#2563eb'] },
    { light: ['#34d399', '#059669'], dark: ['#34d399', '#059669'] },
    { light: ['#2dd4bf', '#0e7490'], dark: ['#2dd4bf', '#0e7490'] },
  ];
  function getCardColors() {
    const styles = typeof window !== 'undefined' ? getComputedStyle(document.documentElement) : { getPropertyValue: () => '' };
    return {
      bg: styles.getPropertyValue('--card-bg').trim() || '#fff',
      fg: styles.getPropertyValue('--card-fg').trim() || '#23243a',
      border: styles.getPropertyValue('--card-border').trim() || accent,
      shadow: styles.getPropertyValue('--card-shadow').trim() || '0 6px 32px 0 rgba(24,25,38,0.18)',
    };
  }
  const cardColors = getCardColors();
  return (
    <div style={{ width: 420, height: 420, background: 'transparent', borderRadius: 24, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ReactECharts
        style={{ width: '100%', height: 420 }}
        option={{
          backgroundColor: 'transparent',
          tooltip: {
            trigger: 'item',
            backgroundColor: cardColors.bg,
            borderColor: cardColors.border,
            borderWidth: 2,
            extraCssText: `
              border-radius: 18px;
              box-shadow: ${cardColors.shadow};
              padding: 18px 22px;
              min-width: 120px;
              text-align: center;
            `,
            textStyle: {
              color: cardColors.fg,
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'Inter, Arial',
            },
            formatter: (params: any) => (
              `<div style="font-size:18px;font-weight:700;margin-bottom:2px;color:${theme === 'dark' ? '#34d399' : '#6c63ff'};">${params.name}</div>
               <div style="font-size:16px;color:${cardColors.fg};">${params.percent}%</div>
               <div style="font-size:15px;color:#888c94;">${params.value.toLocaleString('ru-RU')} ₽</div>`
            ),
          },
          legend: { show: false },
          graphic: [
            {
              type: 'text',
              left: 'center',
              top: 'center',
              z: 100,
              style: {
                text: `₽ ${total.toLocaleString('ru-RU', { maximumFractionDigits: 2 })}`,
                font: 'bold 32px \'Inter\', Arial',
                fill: theme === 'dark' ? '#fff' : '#23243a',
                textAlign: 'center',
                textVerticalAlign: 'middle',
                shadowColor: theme === 'dark' ? '#181926' : 'transparent',
                shadowBlur: 8,
              },
            },
          ],
          // убираем сумму из центра
          series: [
            {
              name: 'Портфель',
              type: 'pie',
              radius: ['68%', '88%'],
              center: ['50%', '50%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 8,
                borderColor: '#181926',
                borderWidth: 2,
                shadowBlur: 0,
                shadowColor: 'transparent',
              },
              label: {
                show: false,
              },
              labelLine: {
                show: false,
              },
              minAngle: 10,
              startAngle: 90,
              clockwise: true,
              padAngle: 4,
              data: assets.map((a, i) => ({
                value: a.value,
                name: a.symbol,
                itemStyle: {
                  color: {
                    type: 'linear', x: 0, y: 0, x2: 1, y2: 1,
                    colorStops: [
                      { offset: 0, color: PIE_COLORS[i % PIE_COLORS.length][theme][0] },
                      { offset: 1, color: PIE_COLORS[i % PIE_COLORS.length][theme][1] },
                    ],
                  },
                  borderRadius: 8,
                },
              }))
            },
          ],
        }}
        opts={{ renderer: 'canvas' }}
      />
    </div>
  );
}

// Аналитика портфеля на основе реальных инструментов
export function PortfolioMiniAnalytics({ instruments, loading, error }: { instruments: InstrumentBase[], loading: boolean, error: string }) {
  const midPrices = useAllOrderbookSpreads(instruments.map(a => a.instrumentId));
  // Получаем тикер для каждого инструмента (если нет symbol)
  function getTicker(a: InstrumentBase) {
    // enrichedInstruments всегда содержит a.ticker
    return (a as any).ticker || a.symbol || String(a.instrumentId);
  }
  if (loading) return <div className="text-light-fg/70 dark:text-dark-fg/70">Загрузка...</div>;
  if (error) return <div className="text-red-500 dark:text-red-400">{error}</div>;
  if (!instruments || instruments.length === 0) return <div className="text-light-fg/70 dark:text-dark-fg/70">Нет инструментов</div>;
  // Считаем стоимость каждого актива по актуальному spread
  const assets = instruments.map(a => ({
    symbol: getTicker(a),
    name: a.name || '',
    value: (a.totalAmount || 0) * (midPrices[a.instrumentId] || 0),
  }));
  const total = assets.reduce((sum, a) => sum + a.value, 0);
  // Сортируем по стоимости
  const sorted = [...assets].sort((a, b) => b.value - a.value);
  // Топ-3 актива с вычисленной долей
  const topAssets = sorted.slice(0, 3).map((a, i) => ({
    ...a,
    percent: total ? +(a.value / total * 100).toFixed(1) : 0,
    color: [
      'bg-gradient-to-r from-yellow-400 to-yellow-500',
      'bg-gradient-to-r from-blue-400 to-blue-600',
      'bg-gradient-to-r from-emerald-400 to-emerald-600',
      'bg-gradient-to-r from-cyan-400 to-cyan-600',
    ][i % 4],
  }));
  return (
    <div className="flex flex-col gap-2 items-center justify-center w-full">
      <span className="text-[22px] font-extrabold text-light-accent dark:text-dark-accent mb-0.5">
        <BiAnalyse className="inline-block align-middle text-[22px] mr-1 text-light-accent dark:text-dark-accent" />
      </span>
      <div className="text-[13px] text-light-fg/80 dark:text-dark-brown">Суммарная стоимость</div>
      <div className="text-[18px] font-extrabold text-light-accent dark:text-dark-accent mb-1">₽ {total.toLocaleString('ru-RU')}</div>
      <div className="w-full flex flex-col gap-1">
        {topAssets.map(a => (
          <div key={a.symbol} className="flex items-center gap-1 w-full">
            <span className={`w-2 h-2 rounded-full ${a.color} inline-block`} />
            <span className="font-semibold text-light-fg dark:text-dark-fg text-[13px]">{a.symbol}</span>
            <span className="text-light-fg/80 dark:text-dark-brown text-[12px]">{a.name}</span>
            <div className="flex-1 mx-1 h-1.5 rounded-full bg-light-bg/40 dark:bg-dark-bg/40 overflow-hidden">
              <div className={`h-1.5 rounded-full ${a.color}`} style={{ width: `${a.percent}%` }} />
            </div>
            <span className="ml-auto text-[12px] font-bold text-light-accent dark:text-dark-accent min-w-[32px] text-right">{a.percent}%</span>
          </div>
        ))}
      </div>
      <div className="mt-1 text-[12px] text-light-fg/80 dark:text-dark-brown flex flex-row gap-2 items-center">
        {topAssets[0] && <span>Доля {topAssets[0].symbol}: <span className="font-bold text-light-accent dark:text-dark-accent">{topAssets[0].percent}%</span></span>}
        <span className="mx-1">/</span>
        <span>Диверсификация: <span className="font-bold text-light-accent dark:text-dark-accent">{topAssets.length > 1 ? 'средняя' : 'низкая'}</span></span>
      </div>
    </div>
  );
}

// Простой компонент для отображения списка инструментов
export function PortfolioInstrumentsList({ instruments, loading, error, noMargin }: { instruments: InstrumentBase[], loading: boolean, error: string, noMargin?: boolean }) {
  function getTicker(a: InstrumentBase) {
    return a.ticker || a.symbol || String(a.instrumentId);
  }
  if (loading) return <div className="text-light-fg/70 dark:text-dark-fg/70">Загрузка...</div>;
  if (error) return <div className="text-red-500 dark:text-red-400">{error}</div>;
  if (!instruments || instruments.length === 0) return <div className="text-light-fg/70 dark:text-dark-fg/70">Нет инструментов</div>;
  return (
    <div className={`bg-white/90 dark:bg-[#18191c] border border-light-border/30 dark:border-[#23243a] shadow-inner dark:shadow-[inset_0_2px_16px_0_rgba(0,0,0,0.25)] rounded-2xl h-full ${noMargin ? '' : 'mt-2'} p-0`}>
      <div className="text-[18px] font-bold text-light-accent dark:text-dark-accent mb-4">Ваши инструменты</div>
      <div className="overflow-x-auto flex-1">
        <table className="min-w-full text-left text-[15px]">
          <thead>
            <tr className="text-light-fg/80 dark:text-dark-brown font-semibold">
              <th className="py-2 px-3">Символ</th>
              <th className="py-2 px-3">Название</th>
              <th className="py-2 px-3">Количество</th>
              {/* <th className="py-2 px-3">Стоимость</th> */}
              <th className="py-2 px-3">Доходность</th>
            </tr>
          </thead>
          <tbody>
            {instruments.map(inst => {
              const { data, loading, error } = useInstrumentProfitability(inst.instrumentId);
              return (
                <tr key={inst.instrumentId} className="hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 transition-all">
                  <td className="py-2 px-3 font-mono font-bold text-light-accent dark:text-dark-accent">{getTicker(inst)}</td>
                  <td className="py-2 px-3">{inst.name || '-'}</td>
                  <td className="py-2 px-3 font-mono">{inst.totalAmount}</td>
                  {/* <td className="py-2 px-3 font-mono">₽ {(inst.price && inst.totalAmount) ? (inst.price * inst.totalAmount).toLocaleString('ru-RU', { maximumFractionDigits: 2 }) : '—'}</td> */}
                  <td className="py-2 px-3 font-mono">
                    {loading ? <span className="text-xs text-light-fg/60 dark:text-dark-brown/70">...</span>
                      : error ? <span className="text-xs text-red-500 dark:text-red-400">!</span>
                      : data && data.profitability !== undefined ? <span className="text-xs text-light-accent dark:text-dark-accent font-semibold">{data.profitability}%</span>
                      : <span className="text-xs text-light-fg/60 dark:text-dark-brown/70">Нет аналитики</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Вынесу массовый хук для получения midPrices ДО всех его использований
function useAllOrderbookSpreads(instrumentIds: (number | string)[]) {
  const [midPrices, setMidPrices] = React.useState<{ [id: number]: number }>({});
  React.useEffect(() => {
    if (!instrumentIds.length) return;
    let cancelled = false;
    const fetchAll = async () => {
      const results: { [id: number]: number } = {};
      await Promise.all(
        instrumentIds.map(async (id) => {
          try {
            const res = await fetch(`http://wolf-street.ru/market-data-service/api/v1/orderbook/${id}/spread`);
            const data = await res.json();
            results[id as number] = (data && typeof data.midPrice === 'number') ? data.midPrice : 0;
          } catch {
            results[id as number] = 0;
          }
        })
      );
      if (!cancelled) setMidPrices(results);
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [instrumentIds.join(",")]);
  return midPrices;
} 