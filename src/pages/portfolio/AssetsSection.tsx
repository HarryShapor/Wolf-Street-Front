import { useMemo, useState, useEffect } from 'react';
import { FaPlus, FaArrowRight, FaChartLine, FaExchangeAlt, FaSearch } from 'react-icons/fa';
import btcIcon from '../../image/crypto/bitcoin.svg';
import ethIcon from '../../image/crypto/ethereum.svg';
import usdtIcon from '../../image/crypto/usdt.svg';
import tonIcon from '../../image/crypto/ton.svg';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { Portfolio3DPie } from './ProfileSection';
import { API_HOST } from '../../services/Api';
import { useInstruments } from '../../hooks/useInstruments';
import CustomSelect from '../../components/ui/CustomSelect';
import Modal from '../../components/ui/Modal';

// Тип для инструмента
interface Instrument {
  instrumentId: number;
  availableAmount: number;
  blockedAmount: number;
  totalAmount: number;
  // Для отображения:
  symbol?: string;
  name?: string;
  type?: string;
  price?: number;
  iconUrl?: string;
  totalPrice?: number; // добавляем поле для стоимости из API
}

// Тип для стоимости инструмента
type InstrumentValue = {
  instrumentId: number;
  lotPrice: number;
  totalPrice: number;
};

const instrumentMeta: Record<number, { symbol: string; name: string; type: string; price: number; iconUrl: string }> = {
  // Пример: заполнить по известным instrumentId
  9007199254740991: { symbol: 'BTC/USDT', name: 'Биткоин/Тетер', type: 'Спот', price: 2730000, iconUrl: btcIcon },
  // ... добавить другие id и метаданные
};

// Pie chart цвета (можно заменить на фирменные)
const PIE_COLORS = [
  'from-[#fbbf24] to-[#f59e42]', // BTC — жёлтый
  'from-[#60a5fa] to-[#2563eb]', // ETH — синий
  'from-[#10b981] to-[#059669]', // USDT — зелёный
  'from-[#38bdf8] to-[#0ea5e9]', // TON — голубой
];

function formatNumber(n: number, max = 8) {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: max });
}

function PieChart({ pie, colors, size = 220 }: { pie: number[]; colors: string[]; size?: number }) {
  let startAngle = 0;
  const r = size / 2 - 10; // padding 10px
  const center = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <g filter="url(#pieShadow)">
        {pie.map((p, i) => {
          const angle = p * 360;
          const endAngle = startAngle + angle;
          const x1 = center + r * Math.cos((startAngle - 90) * Math.PI / 180);
          const y1 = center + r * Math.sin((startAngle - 90) * Math.PI / 180);
          const x2 = center + r * Math.cos((endAngle - 90) * Math.PI / 180);
          const y2 = center + r * Math.sin((endAngle - 90) * Math.PI / 180);
          const large = angle > 180 ? 1 : 0;
          const path = `M${center},${center} L${x1},${y1} A${r},${r} 0 ${large} 1 ${x2},${y2} Z`;
          const gradId = `pie${i}`;
          const el = (
            <path
              key={i}
              d={path}
              fill={`url(#${gradId})`}
              stroke="#181926"
              strokeWidth="2"
              className="transition-all duration-300"
            />
          );
          startAngle += angle;
          return el;
        })}
      </g>
      <defs>
        {colors.map((c, i) => (
          <linearGradient key={i} id={`pie${i}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c.split(' ')[0].replace('from-[', '').replace(']', '')} />
            <stop offset="100%" stopColor={c.split(' ')[1].replace('to-[', '').replace(']', '')} />
          </linearGradient>
        ))}
        <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#000" floodOpacity="0.25"/>
        </filter>
      </defs>
    </svg>
  );
}

// --- Добавление и удаление инструмента (тестовые кнопки) ---
async function addInstrument(instrumentId: number, onResult: (err?: string) => void) {
  try {
    const res = await fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/instruments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ instrumentId })
    });
    if (!res.ok) throw new Error(await res.text());
    onResult();
  } catch (err: any) {
    onResult(err.message || 'Ошибка добавления инструмента');
  }
}

async function deleteInstrument(instrumentId: number, onResult: (err?: string) => void) {
  try {
    const res = await fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/instruments`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: JSON.stringify({ instrumentId })
    });
    if (!res.ok) throw new Error(await res.text());
    onResult();
  } catch (err: any) {
    onResult(err.message || 'Ошибка удаления инструмента');
  }
}

// Функция для перевода ошибок на русский
function getErrorMessage(err: string) {
  if (/400/.test(err) && /position|values|contains/i.test(err)) return 'Пользователь содержит позиции по инструменту!';
  if (/401/.test(err)) return 'Пользователь не авторизован!';
  if (/404/.test(err)) return 'Портфель пользователя или инструмент не найден!';
  if (/успешно удален|success/i.test(err)) return 'Инструмент успешно удалён!';
  return 'Произошла ошибка. Попробуйте ещё раз.';
}

export default function AssetsSection() {
  const [search, setSearch] = useState('');
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Загружаем стоимости инструментов
  const [values, setValues] = useState<InstrumentValue[]>([]);
  const [loadingValues, setLoadingValues] = useState(true);
  const [errorValues, setErrorValues] = useState('');

  const { instruments: allInstruments, loading: loadingAllInstruments } = useInstruments();
  // Инструменты, которых нет у пользователя
  const availableToAdd = useMemo(() => allInstruments.filter(
    inst => !instruments.some(userInst => userInst.instrumentId === inst.instrumentId)
  ), [allInstruments, instruments]);
  const [selectedToAdd, setSelectedToAdd] = useState<number | null>(null);
  // Для отладки:
  useEffect(() => { console.log('availableToAdd', availableToAdd); }, [availableToAdd]);

  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/instruments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    })
      .then(async res => {
        if (res.status === 401) throw new Error('Пользователь не авторизован!');
        if (res.status === 404) throw new Error('Портфель пользователя не найден!');
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          // Добавить метаданные для отображения
          setInstruments(data.map((item: Instrument) => ({
            ...item,
            ...(instrumentMeta[item.instrumentId] || {}),
          })));
        } else {
          setInstruments([]);
        }
      })
      .catch(err => setError(err.message || 'Ошибка загрузки инструментов'))
      .finally(() => setLoading(false));
  }, []);

  // Загружаем стоимости инструментов только после загрузки инструментов и если они есть
  useEffect(() => {
    if (!instruments.length) {
      setValues([]);
      return;
    }
    setLoadingValues(true);
    setErrorValues('');
    fetch(`${API_HOST}/api/v1/portfolio/value`, { credentials: 'include' })
      .then(async res => {
        if (res.status === 401) throw new Error('Пользователь не авторизован!');
        if (res.status === 404) throw new Error('Портфель пользователя не найден!');
        return res.json();
      })
      .then((data: InstrumentValue[]) => {
        setValues(Array.isArray(data) ? data : []);
      })
      .catch(err => setErrorValues(err.message || 'Ошибка загрузки стоимости инструментов'))
      .finally(() => setLoadingValues(false));
  }, [instruments.map(i => i.instrumentId).join(',')]);

  // Объединяем инструменты с их стоимостью
  const instrumentsWithValue = useMemo(() => {
    if (!values.length) return instruments;
    return instruments.map(inst => {
      const val = values.find(v => v.instrumentId === inst.instrumentId);
      return val ? { ...inst, totalPrice: val.totalPrice } : inst;
    });
  }, [instruments, values]);

  const total = useMemo(() => instrumentsWithValue.reduce((sum, a) => sum + (a.totalPrice ?? (a.totalAmount * (a.price || 1))), 0), [instrumentsWithValue]);
  const totalUSDT = useMemo(() => total / 92, [total]);
  const pie = useMemo(() => instrumentsWithValue.map(a => (a.totalPrice ?? (a.totalAmount * (a.price || 1))) / (total || 1)), [instrumentsWithValue, total]);
  const filtered = useMemo(() =>
    instrumentsWithValue.filter(a =>
      (a.symbol || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.name || '').toLowerCase().includes(search.toLowerCase())
    ), [search, instrumentsWithValue]
  );

  // Добавление/удаление инструментов (UI)
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [selectedToDelete, setSelectedToDelete] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');

  const handleAdd = () => {
    const testInstrumentId = Object.keys(instrumentMeta)[0] ? Number(Object.keys(instrumentMeta)[0]) : 9007199254740991;
    setActionLoading(true);
    setActionError('');
    addInstrument(testInstrumentId, (err) => {
      if (err) {
        setModalTitle('Ошибка');
        let msg = err;
        try {
          const parsed = JSON.parse(err);
          msg = parsed.message || parsed.error || err;
        } catch {}
        setModalMessage(getErrorMessage(msg));
        setModalOpen(true);
      }
      setActionLoading(false);
      // Обновить список инструментов
      setLoading(true);
      fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/instruments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
        .then(async res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setInstruments(data.map((item: Instrument) => ({
              ...item,
              ...(instrumentMeta[item.instrumentId] || {}),
            })));
          }
        })
        .finally(() => setLoading(false));
    });
  };

  const handleDelete = () => {
    if (!selectedToDelete) return;
    setActionLoading(true);
    setActionError('');
    deleteInstrument(selectedToDelete, (err) => {
      if (err) {
        setModalTitle('Ошибка');
        let msg = err;
        try {
          const parsed = JSON.parse(err);
          msg = parsed.message || parsed.error || err;
        } catch {}
        setModalMessage(getErrorMessage(msg));
        setModalOpen(true);
      }
      setActionLoading(false);
      // Обновить список инструментов
      setLoading(true);
      fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/instruments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      })
        .then(async res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setInstruments(data.map((item: Instrument) => ({
              ...item,
              ...(instrumentMeta[item.instrumentId] || {}),
            })));
          }
        })
        .finally(() => setLoading(false));
    });
  };

  // --- state for custom dropdown ---
  const [showDropdown, setShowDropdown] = useState(false);

  // Автоматическое закрытие модалки через 2 секунды
  useEffect(() => {
    if (!modalOpen) return;
    const timer = setTimeout(() => setModalOpen(false), 2000);
    return () => clearTimeout(timer);
  }, [modalOpen]);

  return (
    <div className="bg-gradient-to-br from-light-card/95 to-light-bg/80 dark:from-dark-card/95 dark:to-[#181926]/90 rounded-3xl shadow-2xl card-glow backdrop-blur-xl border border-light-border/40 dark:border-dark-border/40 p-8 flex flex-col gap-5 transition-all duration-300">
      {/* Верхний блок: поиск+кнопки слева, диаграмма справа */}
      <div className="flex flex-col md:flex-row md:items-start md:gap-8">
        {/* Левая колонка: поиск + кнопки */}
        <div className="flex-1 flex flex-col gap-4 mb-6 md:mb-0 md:max-w-[340px]">
          <div className="relative w-full">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-light-accent dark:text-dark-accent text-[16px] pointer-events-none"><FaSearch /></span>
            <input
              type="text"
              placeholder="Поиск по инструментам..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-xl border border-light-border/40 dark:border-dark-border/40 bg-white/80 dark:bg-[#23243a]/90 text-[16px] focus:outline-none focus:ring-2 focus:ring-light-accent/30 dark:focus:ring-dark-accent/30 w-full shadow-inner dark:shadow-inner placeholder:text-light-fg/60 dark:placeholder:text-[#888c94]"
            />
          </div>
          <div className="flex flex-row gap-4 mt-2">
            <Button variant="gradient" size="md" iconLeft={<FaPlus />} className="shadow-md dark:shadow-lg">Пополнить</Button>
            <Button variant="gradient" size="md" iconLeft={<FaArrowRight />} className="shadow-md dark:shadow-lg">Вывести</Button>
            <Button variant="gradient" size="md" iconLeft={<FaExchangeAlt />} className="shadow-md dark:shadow-lg">Трансфер</Button>
          </div>
          {/* Кастомный современный выбор инструмента для удаления */}
          <div className="flex flex-col gap-3 mt-4 items-stretch max-w-xs">
            {/* Новый выпадающий список для добавления инструмента */}
            <div className="flex flex-col gap-2 mt-2 items-stretch max-w-xs">
              <CustomSelect
                value={selectedToAdd !== null ? String(selectedToAdd) : ''}
                onChange={val => setSelectedToAdd(val ? Number(val) : null)}
                options={
                  availableToAdd.length
                    ? availableToAdd.map(inst => ({
                        value: String(inst.instrumentId),
                        label: inst.ticker
                      }))
                    : [{ value: '', label: 'Нет доступных инструментов', disabled: true }]
                }
                placeholder="Выберите инструмент для добавления"
                className="min-h-[32px] text-sm"
              />
              <button
                onClick={() => selectedToAdd && addInstrument(selectedToAdd, (err) => {
                  if (err) {
                    setModalTitle('Ошибка');
                    let msg = err;
                    try {
                      const parsed = JSON.parse(err);
                      msg = parsed.message || parsed.error || err;
                    } catch {}
                    setModalMessage(getErrorMessage(msg));
                    setModalOpen(true);
                  }
                  setActionLoading(false);
                  setSelectedToAdd(null);
                  // обновить список инструментов ...
                  setLoading(true);
                  fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/instruments`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                  })
                    .then(async res => res.json())
                    .then(data => {
                      if (Array.isArray(data)) {
                        setInstruments(data.map((item: Instrument) => ({
                          ...item,
                          ...(instrumentMeta[item.instrumentId] || {}),
                        })));
                      }
                    })
                    .finally(() => setLoading(false));
                })}
                disabled={actionLoading || !selectedToAdd || !availableToAdd.length}
                className={`w-full py-2 rounded-xl font-semibold transition-all duration-150
                  ${!selectedToAdd || actionLoading || !availableToAdd.length
                    ? 'bg-light-accent/30 text-light-fg/60 dark:bg-dark-accent/30 dark:text-dark-fg/60 cursor-not-allowed'
                    : 'bg-light-accent text-white dark:bg-dark-accent dark:text-dark-bg hover:brightness-110 hover:shadow-lg'}
                `}
                style={{ fontSize: 15, marginTop: 2 }}
              >
                + Добавить инструмент
              </button>
            </div>
            {/* Новый выпадающий список для удаления инструмента */}
            <div className="flex flex-col gap-2 mt-2 items-stretch max-w-xs">
              <CustomSelect
                value={selectedToDelete !== null ? String(selectedToDelete) : ''}
                onChange={val => setSelectedToDelete(val ? Number(val) : null)}
                options={
                  instruments.length
                    ? instruments.map(inst => ({
                        value: String(inst.instrumentId),
                        label: inst.ticker || inst.symbol || String(inst.instrumentId)
                      }))
                    : [{ value: '', label: 'Нет инструментов для удаления', disabled: true }]
                }
                placeholder="Выберите инструмент для удаления"
                className="min-h-[32px] text-sm"
              />
              <button
                onClick={() => selectedToDelete && deleteInstrument(selectedToDelete, (err) => {
                  if (err) {
                    setModalTitle('Ошибка');
                    let msg = err;
                    try {
                      const parsed = JSON.parse(err);
                      msg = parsed.message || parsed.error || err;
                    } catch {}
                    setModalMessage(getErrorMessage(msg));
                    setModalOpen(true);
                  }
                  setActionLoading(false);
                  setSelectedToDelete(null);
                  // обновить список инструментов ...
                  setLoading(true);
                  fetch(`${API_HOST}/portfolio-service/api/v1/portfolio/instruments`, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                  })
                    .then(async res => res.json())
                    .then(data => {
                      if (Array.isArray(data)) {
                        setInstruments(data.map((item: Instrument) => ({
                          ...item,
                          ...(instrumentMeta[item.instrumentId] || {}),
                        })));
                      }
                    })
                    .finally(() => setLoading(false));
                })}
                disabled={actionLoading || !selectedToDelete || !instruments.length}
                className={`w-full py-2 rounded-xl font-semibold transition-all duration-150
                  ${!selectedToDelete || actionLoading || !instruments.length
                    ? 'bg-red-200/30 text-red-300 dark:bg-red-900/20 dark:text-red-400 border border-red-200/40 dark:border-red-900/40 cursor-not-allowed'
                    : 'bg-red-500/20 text-red-600 dark:bg-red-600/20 dark:text-red-400 border border-red-400/40 dark:border-red-600/40 hover:bg-red-500/40 hover:text-white dark:hover:bg-red-600/40 dark:hover:text-white'}
                `}
                style={{ fontSize: 15, marginTop: 2 }}
              >
                Удалить инструмент
              </button>
            </div>
            <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={modalTitle}>
               <div className="text-red-500 dark:text-red-400 text-center text-base whitespace-pre-line" style={{minWidth:220}}>{modalMessage}</div>
            </Modal>
          </div>
        </div>
        {/* Диаграмма справа */}
        <div className="flex-1 flex justify-center md:justify-end mb-6 md:mb-0">
          <div className="p-4 rounded-2xl flex items-center justify-center w-full max-w-[360px] transition-all">
            <Portfolio3DPie assets={instrumentsWithValue.map((a, i) => ({
              symbol: a.symbol || String(a.instrumentId),
              name: a.name || '',
              percent: pie[i] * 100,
              value: Math.round((a.totalAmount || 0) * (a.price || 1)),
              color: PIE_COLORS[i % PIE_COLORS.length],
            }))} />
          </div>
        </div>
      </div>
      {/* Список активов */}
      {loading ? (
        <div className="py-12 text-center text-light-fg/70 dark:text-dark-fg/70">Загрузка...</div>
      ) : error ? (
        <div className="py-12 text-center text-red-500 dark:text-red-400">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center text-light-fg/70 dark:text-dark-fg/70">Нет инструментов</div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map((a, i) => (
          <div key={a.symbol} className="p-6 bg-white/90 dark:bg-[#18191c] border border-light-border/30 dark:border-[#23243a] shadow-inner dark:shadow-[inset_0_2px_16px_0_rgba(0,0,0,0.25)] rounded-2xl flex flex-col gap-4 transition-all duration-300">
            <div className="flex items-center gap-4 mb-1">
              <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/90 dark:bg-[#23243a]/90 border-2 border-light-accent dark:border-dark-accent shadow">
                <img src={a.iconUrl} alt={a.symbol} className="w-8 h-8" />
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-light-accent dark:text-dark-accent text-[20px] tracking-tight truncate">{a.symbol}</span>
                  <span className="ml-2 px-2 py-0.5 rounded bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent text-xs font-semibold">{a.type}</span>
                </div>
                <span className="text-light-fg/80 dark:text-dark-brown text-[15px] truncate">{a.name}</span>
              </div>
              <span className="text-[20px] font-bold text-green-600 dark:text-green-400 ml-auto whitespace-nowrap">₽ {formatNumber(a.totalPrice ?? (a.price || 1) * (a.totalAmount || 0), 2)}</span>
            </div>
            <div className="flex flex-row flex-wrap gap-6 items-center text-[15px] font-medium">
              <div className="flex flex-col"><span className="text-xs text-light-fg/60 dark:text-dark-brown/70">Доступно</span><span className="font-mono text-[16px] font-bold text-light-fg dark:text-dark-fg">{formatNumber(a.availableAmount)}</span></div>
              <div className="flex flex-col"><span className="text-xs text-light-fg/60 dark:text-dark-brown/70">В ордерах</span><span className="font-mono text-[16px] text-light-fg/70 dark:text-gray-500">{a.blockedAmount ? formatNumber(a.blockedAmount) : '—'}</span></div>
              <div className="flex flex-col"><span className="text-xs text-light-fg/60 dark:text-dark-brown/70">Всего</span><span className="font-mono text-[16px] text-light-fg dark:text-dark-fg">{formatNumber(a.totalAmount)}</span></div>
              <div className="flex flex-col ml-auto"><span className="text-xs text-light-fg/60 dark:text-dark-brown/70">Стоимость</span><span className="font-mono text-[16px] font-bold text-light-accent dark:text-dark-accent">₽ {formatNumber(a.totalPrice ?? (a.price || 1) * (a.totalAmount || 0), 2)}</span></div>
            </div>
            <div className="flex gap-3 mt-2">
              <Button title="Пополнить" variant="gradient" size="sm" iconLeft={<FaPlus />} className="rounded-xl px-4 py-2" />
              <Button title="Вывести" variant="gradient" size="sm" iconLeft={<FaArrowRight />} className="rounded-xl px-4 py-2" />
              <Button title="Торговать" variant="gradient" size="sm" iconLeft={<FaChartLine />} className="rounded-xl px-4 py-2" />
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
} 